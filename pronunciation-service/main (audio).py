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
# Initialize FastAPI app
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Azure Speech Config
speech_key = "kRz6RoUk9G5gTCrYTJk6YrRk75uMWDxI8m2Z8XV0GzEsq79ivNTmJQQJ99BEACqBBLyXJ3w3AAAYACOG65oM"
speech_region = "southeastasia"
speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=speech_region)

# Initialize G2P model
g2p = G2p()

def transcribe_audio_azure(file_path):
    audio_config = speechsdk.audio.AudioConfig(filename=file_path)
    recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
    result = recognizer.recognize_once()
    return result.text.lower()

def get_phonemes_g2p(word):
    phonemes = g2p(word)
    return [p for p in phonemes if p != ' ']

def correct_misspelling(word, word_list):
    closest_match, _ = process.extractOne(word, word_list)
    return closest_match

def phoneme_alignment_dtw(expected_phonemes, transcribed_phonemes):
    phoneme_dict = {phoneme: idx for idx, phoneme in enumerate(set(expected_phonemes + transcribed_phonemes))}
    expected_indices = [phoneme_dict[phoneme] for phoneme in expected_phonemes]
    transcribed_indices = [phoneme_dict[phoneme] for phoneme in transcribed_phonemes]
    distance, path = fastdtw(expected_indices, transcribed_indices)
    return distance, path, expected_phonemes, transcribed_phonemes

def highlight_word(expected_word, path, expected_phonemes, transcribed_phonemes):
    highlighted_word = list(expected_word)
    mismatches = []
    for (i, j) in path:
        if i < len(expected_phonemes) and j < len(transcribed_phonemes):
            if expected_phonemes[i] != transcribed_phonemes[j]:
                if j < len(highlighted_word):
                    highlighted_word[j] = f"<span class='text-red-500'>{highlighted_word[j]}</span>"
                mismatches.append((i, expected_phonemes[i], transcribed_phonemes[j]))
    return "".join(highlighted_word), mismatches

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

    if transcribed_word.strip().lower() == expected_word.strip().lower():
        return {
            "result": "correct",
            "transcribed_word": transcribed_word,
            "full_transcription": transcribed_text
        }

    # Use g2p for phoneme extraction
    expected_phonemes = get_phonemes_g2p(expected_word)
    transcribed_phonemes = get_phonemes_g2p(transcribed_word)

    distance, path, aligned_expected, aligned_transcribed = phoneme_alignment_dtw(expected_phonemes, transcribed_phonemes)
    highlighted, mismatches = highlight_word(expected_word, path, aligned_expected, aligned_transcribed)

    missed_phonemes = list({expected for _, expected, transcribed in mismatches})

    return {
        "result": "incorrect",
        "transcribed_word": transcribed_word,
        "expected_word": expected_word,
        "full_transcription": transcribed_text,
        "highlighted_word": highlighted,
        "Expected Phonemes": expected_phonemes,
        "Transcribed Phonemes": transcribed_phonemes,
        "missed_phonemes": missed_phonemes,
        "phoneme_feedback": [
            {"position": i, "expected": expected, "transcribed": transcribed}
            for i, expected, transcribed in mismatches
        ],
        "distance": distance
    }
