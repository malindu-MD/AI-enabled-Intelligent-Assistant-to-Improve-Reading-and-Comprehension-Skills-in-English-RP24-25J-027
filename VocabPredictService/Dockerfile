# Use the slim version of Python 3.9 image as the base image
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the contents of the current directory into the container at /app
COPY . /app

# Install the dependencies from the requirements.txt file
RUN pip install --no-cache-dir -r requirements.txt

# Expose port 8000 for FastAPI
EXPOSE 8000

# Run the FastAPI app with Uvicorn (use api.py as the entry point)
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]



