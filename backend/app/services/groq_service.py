from groq import Groq
from app.config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)


def generate_interview_questions(resume_text: str):
    prompt = f"""
You are an expert technical interviewer.

Based on the following resume, generate 10 personalized interview questions.

Resume:
{resume_text}

Requirements:
- Mix technical and HR questions
- Focus on skills, projects, education, and experience
- Keep questions beginner-to-internship level
- Return only numbered questions
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are an expert AI/ML internship interviewer."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=700
    )

    return response.choices[0].message.content