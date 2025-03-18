import pandas as pd
import os

def load_data():
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(script_dir, "vocabulary_new.csv")

    # Debugging: Check if file exists
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")


    df = pd.read_csv(file_path)
    print(df.head())
    data = []
    for _, row in df.iterrows():
        text = f"Word: {row['word']}\nDefinition: {row['definition']}\nExample: {row['example']}\nCEFR: {row['cefr']}\nSynonyms: {row['Synonyms']}\nAntonyms: {row['Antonyms']}\nType: {row['type']}\nRhymes: {row['Rhymes']}\nRelated: {row['Related']}"

        data.append(text)
    return data, df["word"].tolist()
