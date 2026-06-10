import re


def parse_resume_text(text: str) -> dict:
    email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    phone_match = re.search(r"(\+91[-\s]?)?[6-9]\d{9}", text)

    skills_keywords = [
        "Python", "C++", "Java", "JavaScript", "TypeScript",
        "React", "Next.js", "FastAPI", "Django",
        "MongoDB", "MySQL", "SQL",
        "Machine Learning", "Artificial Intelligence",
        "Data Structures", "Algorithms",
        "HTML", "CSS", "Tailwind CSS",
        "Git", "GitHub", "Vercel"
    ]

    found_skills = []

    for skill in skills_keywords:
        if skill.lower() in text.lower():
            found_skills.append(skill)

    parsed_data = {
        "email": email_match.group(0) if email_match else None,
        "phone": phone_match.group(0) if phone_match else None,
        "skills": found_skills,
    }

    return parsed_data