import os
import numpy as np
from fastdtw import fastdtw
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import librosa
from fuzzywuzzy import process
import azure.cognitiveservices.speech as speechsdk
from g2p_en import G2p
import string

import nltk
nltk.download('averaged_perceptron_tagger_eng')

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

speech_key = "kRz6RoUk9G5gTCrYTJk6YrRk75uMWDxI8m2Z8XV0GzEsq79ivNTmJQQJ99BEACqBBLyXJ3w3AAAYACOG65oM"
speech_region = "southeastasia"
speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=speech_region)

g2p = G2p()

def transcribe_audio_azure(file_path):
    audio_config = speechsdk.audio.AudioConfig(filename=file_path)
    recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
    result = recognizer.recognize_once()
    return result.text.lower()

def get_phonemes_g2p(word):
    phonemes = g2p(word)
    return [p for p in phonemes if p != ' ']

def phoneme_alignment_dtw(expected_phonemes, transcribed_phonemes):
    phoneme_dict = {phoneme: idx for idx, phoneme in enumerate(set(expected_phonemes + transcribed_phonemes))}
    expected_indices = [phoneme_dict[phoneme] for phoneme in expected_phonemes]
    transcribed_indices = [phoneme_dict[phoneme] for phoneme in transcribed_phonemes]
    distance, path = fastdtw(expected_indices, transcribed_indices)
    return distance, path, expected_phonemes, transcribed_phonemes

def generate_highlighted_feedback(expected_phonemes, transcribed_phonemes, path):
    feedback = []
    mispronounced_phonemes = []
    highlights = []

    for i, (ep, tp) in enumerate(zip(expected_phonemes, transcribed_phonemes)):
        if ep == tp:
            feedback.append({"position": i, "expected": ep, "transcribed": tp, "correct": True})
            highlights.append(f"<span class='text-green-500'>{ep}</span>")
        else:
            feedback.append({"position": i, "expected": ep, "transcribed": tp, "correct": False})
            highlights.append(f"<span class='text-red-500'>{tp}</span>")
            mispronounced_phonemes.append({"position": i, "expected": ep, "transcribed": tp})

    highlighted_str = " ".join(highlights)
    return feedback, highlighted_str, mispronounced_phonemes

@app.post("/compare")
async def compare_audio(audio: UploadFile = File(...), expected_word: str = Form(...)):
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, audio.filename)

    with open(file_path, "wb") as f:
        f.write(await audio.read())

    transcribed_text = transcribe_audio_azure(file_path)
    transcribed_words = transcribed_text.split()

    if not transcribed_words:
        return JSONResponse(content={"error": "No words transcribed from the audio."}, status_code=400)

    transcribed_word = transcribed_words[0].strip(string.punctuation)

    expected_phonemes = get_phonemes_g2p(expected_word)
    transcribed_phonemes = get_phonemes_g2p(transcribed_word)

    distance, path, aligned_expected, aligned_transcribed = phoneme_alignment_dtw(expected_phonemes, transcribed_phonemes)

    # Pad phoneme lists to match length for feedback generation
    max_len = max(len(aligned_expected), len(aligned_transcribed))
    aligned_expected += [''] * (max_len - len(aligned_expected))
    aligned_transcribed += [''] * (max_len - len(aligned_transcribed))

    feedback, highlighted, mispronounced = generate_highlighted_feedback(aligned_expected, aligned_transcribed, path)

    return {
        "result": "correct" if expected_word == transcribed_word else "incorrect",
        "expected_word": expected_word,
        "transcribed_word": transcribed_word,
        "full_transcription": transcribed_text,
        "highlighted_phonemes": highlighted,
        "Expected Phonemes": expected_phonemes,
        "Transcribed Phonemes": transcribed_phonemes,
        "phoneme_feedback": feedback,
        "mispronounced_phonemes": mispronounced,
        "distance": distance
    }
