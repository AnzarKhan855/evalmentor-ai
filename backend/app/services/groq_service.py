from groq import Groq
from app.config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)


def generate_interview_questions(resume_text: str):
    prompt = f"""
You are an expert technical interviewer for AI/ML and full-stack internship roles.

Based on the resume below, generate exactly 10 personalized interview questions.

Resume:
{resume_text}

Strict output rules:
- Generate exactly 10 questions.
- Do not write any introduction.
- Do not write phrases like "Here are 10 questions".
- Do not write any conclusion.
- Return only numbered questions from 1 to 10.
- Each question must be on a new line.
- Mix technical, project-based, HR, education-based, and skill-based questions.
- Keep questions beginner-to-internship level.
- Questions should be clear, interview-ready, and personalized to the resume.
- Do not use markdown bold formatting.
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an expert AI/ML internship interviewer. "
                    "You must follow the user's formatting rules exactly."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.5,
        max_tokens=1000,
    )

    questions_text = response.choices[0].message.content

    if not questions_text:
        return "1. Tell me about yourself and your technical background."

    return questions_text.strip()