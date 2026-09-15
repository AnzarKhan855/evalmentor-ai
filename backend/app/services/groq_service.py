import logging
from fastapi import HTTPException, status
from groq import (
    Groq,
    GroqError,
    AuthenticationError,
    RateLimitError,
    APIConnectionError,
    APITimeoutError,
    BadRequestError,
    APIStatusError,
)
from app.config import GROQ_API_KEY, GROQ_MODEL

logger = logging.getLogger("evalmentor.groq")


def get_groq_client() -> Groq:
    if not GROQ_API_KEY or GROQ_API_KEY.strip() in ("", "your_groq_api_key"):
        logger.error("GROQ_API_KEY is not configured or is a placeholder.")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI service is not configured. Please configure GROQ_API_KEY on the server.",
        )
    return Groq(api_key=GROQ_API_KEY.strip())


def generate_interview_questions(resume_text: str):
    client = get_groq_client()

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

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
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
    except AuthenticationError as e:
        logger.error("Groq authentication failed: %s", e)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI service authentication failed. Please verify GROQ_API_KEY on the server.",
        )
    except RateLimitError as e:
        logger.error("Groq rate limit exceeded: %s", e)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="AI service is temporarily rate limited. Please try again shortly.",
        )
    except (APIConnectionError, APITimeoutError) as e:
        logger.error("Groq connection or timeout error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to connect to the AI service. Please try again in a few moments.",
        )
    except BadRequestError as e:
        logger.error("Groq bad request error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI service could not process the resume text. Please check the resume format.",
        )
    except (APIStatusError, GroqError) as e:
        logger.error("Groq API error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI service encountered an error while generating questions.",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Unexpected error in question generation: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while generating interview questions.",
        )

    if not response.choices or not response.choices[0].message:
        logger.error("Groq response choices or message empty")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI service returned an empty response. Please try again.",
        )

    questions_text = response.choices[0].message.content

    if not questions_text or not questions_text.strip():
        return "1. Tell me about yourself and your technical background."

    return questions_text.strip()