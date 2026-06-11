import re
from groq import Groq
from app.config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

def extract_score(evaluation_text: str):
    match = re.search(r"Score:\s*(\d+(?:\.\d+)?)\s*/\s*10", evaluation_text, re.IGNORECASE)

    if match:
        return float(match.group(1))

    return None

def evaluate_answer(question: str, answer: str):
    prompt = f"""
You are an expert technical interviewer.

Question:
{question}

Candidate Answer:
{answer}

Evaluate the answer and provide:

1. Score out of 10
2. Strengths
3. Weaknesses
4. Improved Answer

Return the response in clear sections.
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "You are an expert interview evaluator."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3,
        max_tokens=1000
    )

    return response.choices[0].message.content