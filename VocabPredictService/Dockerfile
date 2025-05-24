
# Use official Python image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy app code
COPY . .

# Expose the port FastAPI will run on
EXPOSE 80


# Run the FastAPI app with Uvicorn (use api.py as the entry point)
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]



