import json
import boto3
import base64

def lambda_handler(event, context):
    # Initialize the Rekognition client
    rekognition = boto3.client('rekognition')
    
    try:
        # Get the base64-encoded image from the request body
        body = json.loads(event['body'])
        image_bytes = base64.b64decode(body['image'])
        
        # Call Rekognition to detect faces and emotions
        response = rekognition.detect_faces(
            Image={'Bytes': image_bytes},
            Attributes=['ALL']
        )
        
        # Extract emotion data from the response
        emotions = []
        if response['FaceDetails']:
            emotions = response['FaceDetails'][0]['Emotions']
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'emotions': emotions
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e)
            })
        }