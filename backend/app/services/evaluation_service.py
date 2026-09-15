import re
import logging
from fastapi import HTTPException, status
from groq import (
    GroqError,
    AuthenticationError,
    RateLimitError,
    APIConnectionError,
    APITimeoutError,
    BadRequestError,
    APIStatusError,
)
from app.services.groq_service import get_groq_client

logger = logging.getLogger("evalmentor.evaluation")


def extract_score(evaluation_text: str):
    if not evaluation_text or not isinstance(evaluation_text, str):
        return None

    match = re.search(r"Score:\s*(\d+(?:\.\d+)?)\s*/\s*10", evaluation_text, re.IGNORECASE)

    if match:
        try:
            return float(match.group(1))
        except (ValueError, TypeError):
            return None

    return None


def evaluate_answer(question: str, answer: str):
    client = get_groq_client()

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

    try:
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
    except AuthenticationError as e:
        logger.error("Groq authentication failed during evaluation: %s", e)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI service authentication failed. Please verify GROQ_API_KEY on the server.",
        )
    except RateLimitError as e:
        logger.error("Groq rate limit exceeded during evaluation: %s", e)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="AI service is temporarily rate limited. Please try again shortly.",
        )
    except (APIConnectionError, APITimeoutError) as e:
        logger.error("Groq connection or timeout error during evaluation: %s", e)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to connect to the AI service. Please try again in a few moments.",
        )
    except BadRequestError as e:
        logger.error("Groq bad request error during evaluation: %s", e)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI service could not process the evaluation request.",
        )
    except (APIStatusError, GroqError) as e:
        logger.error("Groq API error during evaluation: %s", e)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI service encountered an error while evaluating the answer.",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Unexpected error in answer evaluation: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while evaluating the answer.",
        )

    if not response.choices or not response.choices[0].message:
        logger.error("Groq evaluation response choices or message empty")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI service returned an empty evaluation. Please try again.",
        )

    evaluation_content = response.choices[0].message.content
    if not evaluation_content or not evaluation_content.strip():
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI service returned empty feedback. Please try again.",
        )

    return evaluation_content.strip()