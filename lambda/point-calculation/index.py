import json
from collections import Counter
import statistics
import requests
import traceback 
# Configuration
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
GEMINI_API_KEY = "AIzaSyA78rw7GrB4eXQi2XtJkapwRPBbDJad3F0"
MAX_POINTS = 3.0
TIME_PENALTY_THRESHOLD = 25  # seconds per question

class PointCalculator:
    def __init__(self):
        self.api_url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"
        
    def process_round(self, round_data):
        """Main entry point: calculates final points for a round"""
        # Step 1: Algorithmic base score
        base_score = self._calculate_base_score(
            round_data['answers'],
            round_data['response_times']
        )
        
        # Step 2: Prepare Gemini input
        gemini_input = self._prepare_gemini_input(round_data, base_score)
        
        # Step 3: Get Gemini adjustment
        gemini_output = self._get_gemini_adjustment(gemini_input)
        
        # Step 4: Apply final adjustments
        final_score = self._apply_adjustments(
            base_score,
            gemini_output['adjustment'],
            round_data['emotion_data']
        )
        
        return {
            "base_score": round(base_score, 1),
            "gemini_adjustment": gemini_output['adjustment'],
            "final_score": round(final_score, 1),
            "feedback": gemini_output['reason'],
            "error_pattern": gemini_input['error_types']
        }

    def _calculate_base_score(self, answers, response_times):
        """Rule-based scoring (0-3 scale)"""
        accuracy = sum(a['is_correct'] for a in answers) / len(answers)
        avg_time = statistics.mean(response_times)
        
        # Time efficiency factor (0.8 to 1.2 range)
        time_factor = 1.2 - min(avg_time / TIME_PENALTY_THRESHOLD, 1.0)
        
        # Clamp to 0-3 range
        return min(MAX_POINTS, accuracy * MAX_POINTS * time_factor)

    def _prepare_gemini_input(self, round_data, base_score):
        """Prepares structured data for Gemini analysis"""
        emotions = round_data['emotion_data']['Emotions']
        dominant_emotion = max(emotions, key=lambda x: x['Confidence'])
        
        return {
            "accuracy": sum(a['is_correct'] for a in round_data['answers']) / len(round_data['answers']),
            "avg_time": statistics.mean(round_data['response_times']),
            "base_score": base_score,
            "dominant_emotion": dominant_emotion['Type'],
            "emotion_confidence": dominant_emotion['Confidence'],
            "error_types": self._detect_error_patterns(round_data['answers']),
            "difficulty_level": round_data.get('difficulty_level', 2)
        }

    def _detect_error_patterns(self, answers):
        """Identifies error categories"""
        patterns = []
        for a in answers:
            if not a['is_correct']:
                if a.get('time_spent', 0) < 5:
                    patterns.append("rushed")
                elif "grammar" in a.get('tags', []):
                    patterns.append("grammar")
                else:
                    patterns.append("conceptual")
        return Counter(patterns).most_common(2)

    def _get_gemini_adjustment(self, gemini_input):
        """Gets contextual adjustment from Gemini"""
        prompt = f"""
        Analyze this learning round:
        - Accuracy: {gemini_input['accuracy']:.0%}
        - Time/Question: {gemini_input['avg_time']:.1f}s
        - Base Score: {gemini_input['base_score']:.1f}/3
        - Emotion: {gemini_input['dominant_emotion']} ({gemini_input['emotion_confidence']}%)
        - Error Patterns: {', '.join(e[0] for e in gemini_input['error_types'])}

        Suggest:
        1. Points adjustment (-0.5 to +0.5)
        2. Short reason (20 words max)
        
        Respond ONLY with JSON format:
        {{
            "adjustment": float,
            "reason": str
        }}
        """
        
        try:
            response = requests.post(
                self.api_url,
                json={
                    "contents": [{
                        "parts": [{
                            "text": prompt
                        }]
                    }]
                },
                timeout=10  # Add timeout
            )
            
            # Debugging - log the raw response
            print("Gemini raw response:", response.text)
            
            response_data = response.json()
            
            # Validate response structure
            if not response_data.get('candidates'):
                raise ValueError("No candidates in response")
                
            if not response_data['candidates'][0]['content']['parts']:
                raise ValueError("No content parts in response")
                
            response_text = response_data['candidates'][0]['content']['parts'][0]['text']
            
            # Debugging - log the response text
            print("Gemini response text:", response_text)
            
            # Handle empty response
            if not response_text.strip():
                return {"adjustment": 0.0, "reason": "No adjustment - empty response"}
            
            # Clean up Markdown formatting
            response_text = response_text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            response_text = response_text.strip()
                
            return json.loads(response_text)
            
        except json.JSONDecodeError as e:
            print(f"Failed to parse Gemini response: {e}\nResponse text: {response.text if 'response' in locals() else 'No response'}")
            return {"adjustment": 0.0, "reason": "System error - using default adjustment"}
        except Exception as e:
            print(f"Gemini API error: {str(e)}")
            return {"adjustment": 0.0, "reason": "System error - using default adjustment"}

    def _apply_adjustments(self, base_score, gemini_adjustment, emotion_data):
        """Applies final rules and clamping"""
        # Apply Gemini adjustment (weighted 30%)
        adjusted_score = base_score + (gemini_adjustment * 0.3)
        
        # Emotion bonus
        if self._is_positive_emotion(emotion_data):
            adjusted_score = min(adjusted_score + 0.2, MAX_POINTS)
            
        # Perfect round bonus
        if base_score >= 2.9:
            adjusted_score = min(adjusted_score + 0.3, MAX_POINTS)
            
        return max(0.0, min(MAX_POINTS, adjusted_score))

    def _is_positive_emotion(self, emotion_data):
        """Checks for learning-positive emotions"""
        dominant = max(emotion_data['Emotions'], key=lambda x: x['Confidence'])
        return (dominant['Type'] in ['HAPPY', 'CALM']
                and dominant['Confidence'] > 85)
def lambda_handler(event, context):
    try:
        print("Raw event:", event)  # Critical for debugging
        
        # Case 1: Direct Lambda invocation with proper structure
        if all(key in event for key in ['answers', 'response_times', 'emotion_data']):
            pass  # Use event as-is
            
        # Case 2: API Gateway proxy with string body
        elif 'body' in event:
            if isinstance(event['body'], str):
                if not event['body'].strip():
                    return {
                        'statusCode': 400,
                        'body': json.dumps({'error': 'Empty request body'})
                    }
                try:
                    event = json.loads(event['body'])
                except json.JSONDecodeError as e:
                    return {
                        'statusCode': 400,
                        'body': json.dumps({
                            'error': 'Invalid JSON format',
                            'received_body': event['body'],
                            'exception': str(e)
                        })
                    }
            elif isinstance(event['body'], dict):
                event = event['body']
            else:
                return {
                    'statusCode': 400,
                    'body': json.dumps({
                        'error': 'Unexpected body type',
                        'body_type': str(type(event['body']))
                    })
                }
        else:
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'error': 'Invalid request format',
                    'expected': 'Either direct payload or API Gateway format',
                    'received_keys': list(event.keys())
                })
            }

        # Validate required fields
        required_fields = ['answers', 'response_times', 'emotion_data']
        missing_fields = [field for field in required_fields if field not in event]
        if missing_fields:
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'error': 'Missing required fields',
                    'missing': missing_fields,
                    'available_fields': list(event.keys())
                })
            }

        calculator = PointCalculator()
        result = calculator.process_round(event)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(result)
        }
        
    except Exception as e:
        print("Full error:", str(e))
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'error': 'Internal processing error',
                'type': type(e).__name__,
                'message': str(e),
                'stack_trace': traceback.format_exc()
            })
        }

    try: # Handle API Gateway proxy case
        if 'body' in event:
            event = json.loads(event['body'])

          # Validate required fields
        required_fields = ['answers', 'response_times', 'emotion_data']
        missing_fields = [field for field in required_fields if field not in event]
        if missing_fields:
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'error': 'Missing required fields',
                    'missing': missing_fields,
                    'available_fields': list(event.keys())
                })
            }

        calculator = PointCalculator()
        result = calculator.process_round(event)
        return {
            'statusCode': 200,
            'body': json.dumps(result)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        }