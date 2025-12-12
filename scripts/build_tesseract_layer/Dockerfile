FROM lambci/lambda:build-python3.8

# Use the official lambci build image for Python 3.8 which matches Lambda's build/runtime environment.
# Install system packages (tesseract + dev libs) and build Pillow/pytesseract using python3.8 in this image.
RUN yum -y update && \
    # Install EPEL if available so tesseract packages can be installed
    (yum -y install epel-release || true) && \
    yum -y install zip tar which gcc gcc-c++ make automake autoconf libtool pkgconfig \
                   leptonica leptonica-devel tesseract tesseract-devel fontconfig freetype-devel libpng-devel libjpeg-turbo-devel || true && \
    python3.8 -m pip install --upgrade pip && \
    yum clean all

# Create /opt/python for pip-installed Python packages
RUN mkdir -p /opt/python

# Install the Python packages into the layer's python directory
RUN python3.8 -m pip install --no-cache-dir --upgrade -t /opt/python pillow pytesseract

# Ensure tesseract binary is available under /opt/bin (Lambda layers expose root entries under /opt)
RUN mkdir -p /opt/bin
RUN if [ -f /usr/bin/tesseract ]; then cp /usr/bin/tesseract /opt/bin/; else echo "tesseract not found in container" >&2; exit 1; fi

# Fix permissions
RUN chmod -R a+rX /opt

# Default to bash so build script can run container commands
CMD ["/bin/bash"]
