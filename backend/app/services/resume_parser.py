import re


def extract_section(text, start_keyword, end_keywords):
    pattern = rf"{start_keyword}(.*?)(?={'|'.join(end_keywords)}|$)"
    match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)

    if not match:
        return []

    content = match.group(1).strip()

    lines = [
        line.strip()
        for line in content.split("\n")
        if line.strip()
    ]

    return lines


def parse_resume_text(text: str) -> dict:
    lines = [line.strip() for line in text.split("\n") if line.strip()]

    name = None
    if lines:
        first_line = lines[0]
        if len(first_line.split()) <= 5:
            name = first_line

    email_match = re.search(
        r"[\w\.-]+@[\w\.-]+\.\w+",
        text
    )

    phone_match = re.search(
        r"(\+91[-\s]?)?[6-9]\d{9}",
        text
    )

    skills_keywords = [
        "Python",
        "C++",
        "Java",
        "JavaScript",
        "TypeScript",
        "React",
        "Next.js",
        "FastAPI",
        "Django",
        "MongoDB",
        "MySQL",
        "SQL",
        "Machine Learning",
        "Artificial Intelligence",
        "Data Structures",
        "Algorithms",
        "HTML",
        "CSS",
        "Tailwind CSS",
        "Git",
        "GitHub",
        "Vercel",
    ]

    found_skills = []

    for skill in skills_keywords:
        if skill.lower() in text.lower():
            found_skills.append(skill)

    education = extract_section(
        text,
        "Education",
        ["Technical Skills", "Projects", "Training"]
    )

    projects = extract_section(
        text,
        "Projects",
        ["Training", "Certifications", "Leadership"]
    )

    experience = extract_section(
        text,
        "Training",
        ["Certifications", "Leadership"]
    )

    parsed_data = {
        "name": name,
        "email": email_match.group(0) if email_match else None,
        "phone": phone_match.group(0) if phone_match else None,
        "skills": found_skills,
        "education": education,
        "projects": projects,
        "experience": experience,
    }

    return parsed_data