import { useState } from 'react'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    brandName: '',
    productClass: '',
    abv: '',
    netContents: '',
    manufacturerName: '',
    manufacturerAddress: '',
    warnings: '',
  })

  const [labelImage, setLabelImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [apiResult, setApiResult] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLabelImage(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validation
    if (!formData.brandName || !formData.productClass || !formData.abv) {
      alert('Please fill in all required fields (Brand Name, Product Class, and ABV)')
      return
    }

    if (!labelImage) {
      alert('Please upload a label image')
      return
    }

    try {
      // Convert image to base64
      const reader = new FileReader()
      reader.onload = async () => {
        const base64Image = reader.result.split(',')[1] // Remove data:image/...; base64, prefix

        // Send form data with image as parameter
        const submissionData = {
          brandName: formData.brandName,
          productClass: formData.productClass,
          abv: parseFloat(formData.abv),
          netContents: formData.netContents,
          manufacturerName: formData.manufacturerName,
          manufacturerAddress: formData.manufacturerAddress,
          warnings: formData.warnings,
          labelImage: base64Image // Image as base64 parameter
        }

        const response = await fetch('https://6o7i7j573g.execute-api.us-east-1.amazonaws.com/dev/images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submissionData)
        })

        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.error || `API error: ${response.status}`)
        }

        setApiResult(result)
        setSubmitted(true)

        // Reset form
        setFormData({
          brandName: '',
          productClass: '',
          abv: '',
          netContents: '',
          manufacturerName: '',
          manufacturerAddress: '',
          warnings: '',
        })
        setLabelImage(null)
        setImagePreview(null)
      }
      reader.readAsDataURL(labelImage)
    } catch (error) {
      console.error('Error submitting form:', error)
      alert(`Error submitting form: ${error.message}`)
    }
  }

  const handleReset = () => {
    setFormData({
      brandName: '',
      productClass: '',
      abv: '',
      netContents: '',
      manufacturerName: '',
      manufacturerAddress: '',
      warnings: '',
    })
    setLabelImage(null)
    setImagePreview(null)
    setSubmitted(false)
    setApiResult(null)
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>TTB Alcohol Label Approval Application</h1>
        <p className="subtitle">Submit your alcohol product information and label for TTB review</p>
      </header>

      {submitted && (
        <div className="success-message">
          <h2>✓ Form Submitted Successfully</h2>
          <p>Your application has been received and will be reviewed by the TTB.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="ttb-form">
        <div className="form-section">
          <h2>Product Information</h2>
          <p className="section-description">Enter the key details about your alcohol product</p>

          {/* Brand Name */}
          <div className="form-group">
            <label htmlFor="brandName" className="required">Brand Name *</label>
            <input
              type="text"
              id="brandName"
              name="brandName"
              value={formData.brandName}
              onChange={handleInputChange}
              placeholder="e.g., Old Tom Distillery"
              className="form-input"
              required
            />
            <small>The brand under which the product is sold</small>
          </div>

          {/* Product Class/Type */}
          <div className="form-group">
            <label htmlFor="productClass" className="required">Product Class/Type *</label>
            <input
              type="text"
              id="productClass"
              name="productClass"
              value={formData.productClass}
              onChange={handleInputChange}
              placeholder="e.g., Kentucky Straight Bourbon Whiskey or IPA"
              className="form-input"
              required
            />
            <small>The general class or type of the beverage (e.g., Bourbon, Vodka, IPA, Porter)</small>
          </div>

          {/* Alcohol Content */}
          <div className="form-group">
            <label htmlFor="abv" className="required">Alcohol by Volume (ABV) * </label>
            <div className="input-with-suffix">
              <input
                type="number"
                id="abv"
                name="abv"
                value={formData.abv}
                onChange={handleInputChange}
                placeholder="e.g., 45"
                min="0"
                max="100"
                step="0.1"
                className="form-input"
                required
              />
              <span className="suffix">%</span>
            </div>
            <small>The alcohol content as a percentage (0-100%)</small>
          </div>

          {/* Net Contents */}
          <div className="form-group">
            <label htmlFor="netContents">Net Contents</label>
            <input
              type="text"
              id="netContents"
              name="netContents"
              value={formData.netContents}
              onChange={handleInputChange}
              placeholder="e.g., 750 mL or 12 fl oz"
              className="form-input"
            />
            <small>The volume of the product (optional)</small>
          </div>
        </div>

        <div className="form-section">
          <h2>Producer Information</h2>
          <p className="section-description">Information about the manufacturer or bottler (optional)</p>

          {/* Manufacturer Name */}
          <div className="form-group">
            <label htmlFor="manufacturerName">Manufacturer/Bottler Name</label>
            <input
              type="text"
              id="manufacturerName"
              name="manufacturerName"
              value={formData.manufacturerName}
              onChange={handleInputChange}
              placeholder="e.g., ABC Distillery LLC"
              className="form-input"
            />
          </div>

          {/* Manufacturer Address */}
          <div className="form-group">
            <label htmlFor="manufacturerAddress">Manufacturer/Bottler Address</label>
            <input
              type="text"
              id="manufacturerAddress"
              name="manufacturerAddress"
              value={formData.manufacturerAddress}
              onChange={handleInputChange}
              placeholder="e.g., 123 Main St, Louisville, KY 40202"
              className="form-input"
            />
          </div>

          {/* Warnings */}
          <div className="form-group">
            <label htmlFor="warnings">Health Warnings/Notices</label>
            <textarea
              id="warnings"
              name="warnings"
              value={formData.warnings}
              onChange={handleInputChange}
              placeholder="e.g., Government Health Warning..."
              className="form-input form-textarea"
              rows="3"
            ></textarea>
            <small>Any required health warnings or notices (optional)</small>
          </div>
        </div>

        <div className="form-section">
          <h2>Label Image Upload</h2>
          <p className="section-description">Upload an image of your alcohol product label *</p>

          <div className="image-upload-container">
            <div className="image-upload-box">
              <label htmlFor="labelImage" className="image-upload-label">
                <div className="upload-icon">📷</div>
                <p>Click to upload or drag and drop</p>
                <span className="file-info">PNG, JPG, GIF up to 10MB</span>
              </label>
              <input
                type="file"
                id="labelImage"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
                required
              />
            </div>

            {imagePreview && (
              <div className="image-preview-container">
                <h3>Label Preview</h3>
                <img src={imagePreview} alt="Label preview" className="label-preview" />
                <p className="file-name">{labelImage.name}</p>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Submit Application
          </button>
          <button type="reset" onClick={handleReset} className="btn btn-secondary">
            Clear Form
          </button>
        </div>
      </form>

      {apiResult && (
        <div className="verification-panel">
          <h2>Verification Results</h2>
          <p className="verification-overall">Overall match: <strong>{apiResult.verified ? '✔️ MATCH' : '❌ MISMATCH'}</strong></p>

          <div className="verification-section">
            <h3>Processing Info</h3>
            <p>Timestamp: <code>{apiResult.timestamp}</code></p>
          </div>

          <div className="verification-section">
            <h3>Field Verification</h3>
            <table className="verification-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Submitted Value</th>
                  <th>Matched in Image</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(apiResult.fieldComparison || {}).map(([key, info]) => (
                  <tr key={key} className="verification-row">
                    <td className="field-name">{key}</td>
                    <td className="field-value">{info?.submitted?.toString() || '—'}</td>
                    <td className={`field-match ${info?.found_in_image ? 'match-true' : 'match-false'}`}>
                      {info?.found_in_image ? '✔️' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="verification-section">
            <h3>Extracted Text (snippet)</h3>
            <pre className="extracted-snippet">{apiResult.extractedText || 'No extracted text'}</pre>
          </div>

          <div className="form-actions" style={{ justifyContent: 'center', marginTop: 20 }}>
            <button className="btn btn-secondary" onClick={() => setApiResult(null)}>Dismiss Results</button>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <p>TTB Alcohol Label Approval System | {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}

export default App
