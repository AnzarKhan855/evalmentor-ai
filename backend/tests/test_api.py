import unittest
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi.testclient import TestClient
from groq import AuthenticationError, RateLimitError, APIConnectionError
import httpx

from app.main import app
from app.utils.dependencies import get_current_user


class EvalMentorApiTestCase(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app, raise_server_exceptions=False)
        self.origin = "https://evalmentor-ai.vercel.app"
        self.headers = {"Origin": self.origin}

    def tearDown(self):
        app.dependency_overrides.clear()

    def test_cors_preflight_generate_questions(self):
        """Test OPTIONS preflight responds with 200 and valid CORS headers."""
        headers = {
            "Origin": self.origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization,content-type",
        }
        res = self.client.options("/api/resume/generate-questions", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers.get("access-control-allow-origin"), self.origin)
        self.assertEqual(res.headers.get("access-control-allow-credentials"), "true")
        self.assertIn("POST", res.headers.get("access-control-allow-methods", ""))

    def test_unauthenticated_generate_questions(self):
        """Test calling generate-questions without auth returns 401 with CORS headers."""
        res = self.client.post("/api/resume/generate-questions", headers=self.headers)
        self.assertEqual(res.status_code, 401)
        self.assertEqual(res.headers.get("access-control-allow-origin"), self.origin)
        self.assertIn("detail", res.json())

    def test_authenticated_no_resume(self):
        """Test authenticated user without an uploaded resume returns 404 with CORS."""
        fake_user = {"_id": "test-user-123", "name": "Test User", "email": "test@example.com"}
        app.dependency_overrides[get_current_user] = lambda: fake_user

        with patch("app.routes.resume.database") as mock_db:
            mock_resumes = MagicMock()
            mock_resumes.find_one = AsyncMock(return_value=None)
            mock_db.__getitem__.return_value = mock_resumes

            res = self.client.post("/api/resume/generate-questions", headers=self.headers)
            self.assertEqual(res.status_code, 404)
            self.assertEqual(res.headers.get("access-control-allow-origin"), self.origin)
            self.assertIn("No resume found", res.json().get("detail", ""))

    def test_authenticated_empty_resume_text(self):
        """Test resume with empty extracted text returns 400 with CORS."""
        fake_user = {"_id": "test-user-123", "name": "Test User", "email": "test@example.com"}
        app.dependency_overrides[get_current_user] = lambda: fake_user

        with patch("app.routes.resume.database") as mock_db:
            mock_resumes = MagicMock()
            mock_resumes.find_one = AsyncMock(return_value={"_id": "r1", "extracted_text": "   "})
            mock_db.__getitem__.return_value = mock_resumes

            res = self.client.post("/api/resume/generate-questions", headers=self.headers)
            self.assertEqual(res.status_code, 400)
            self.assertEqual(res.headers.get("access-control-allow-origin"), self.origin)
            self.assertIn("Resume text not found", res.json().get("detail", ""))

    def test_groq_authentication_failure(self):
        """Test Groq authentication error returns controlled 502 with CORS headers."""
        fake_user = {"_id": "test-user-123", "name": "Test User", "email": "test@example.com"}
        app.dependency_overrides[get_current_user] = lambda: fake_user

        mock_request = httpx.Request("POST", "https://api.groq.com/openai/v1/chat/completions")
        mock_response = httpx.Response(401, request=mock_request)

        with patch("app.routes.resume.database") as mock_db:
            mock_resumes = MagicMock()
            mock_resumes.find_one = AsyncMock(return_value={"_id": "r1", "extracted_text": "Python React Developer"})
            mock_db.__getitem__.return_value = mock_resumes

            with patch("app.services.groq_service.get_groq_client") as mock_get_client:
                mock_client = MagicMock()
                mock_client.chat.completions.create.side_effect = AuthenticationError(
                    message="Invalid API Key",
                    response=mock_response,
                    body={"error": {"message": "Invalid API Key"}}
                )
                mock_get_client.return_value = mock_client

                res = self.client.post("/api/resume/generate-questions", headers=self.headers)
                self.assertEqual(res.status_code, 502)
                self.assertEqual(res.headers.get("access-control-allow-origin"), self.origin)
                self.assertIn("AI service authentication failed", res.json().get("detail", ""))

    def test_groq_rate_limit_failure(self):
        """Test Groq rate limit error returns controlled 429 with CORS headers."""
        fake_user = {"_id": "test-user-123", "name": "Test User", "email": "test@example.com"}
        app.dependency_overrides[get_current_user] = lambda: fake_user

        mock_request = httpx.Request("POST", "https://api.groq.com/openai/v1/chat/completions")
        mock_response = httpx.Response(429, request=mock_request)

        with patch("app.routes.resume.database") as mock_db:
            mock_resumes = MagicMock()
            mock_resumes.find_one = AsyncMock(return_value={"_id": "r1", "extracted_text": "Python React Developer"})
            mock_db.__getitem__.return_value = mock_resumes

            with patch("app.services.groq_service.get_groq_client") as mock_get_client:
                mock_client = MagicMock()
                mock_client.chat.completions.create.side_effect = RateLimitError(
                    message="Rate limit reached",
                    response=mock_response,
                    body={"error": {"message": "Rate limit reached"}}
                )
                mock_get_client.return_value = mock_client

                res = self.client.post("/api/resume/generate-questions", headers=self.headers)
                self.assertEqual(res.status_code, 429)
                self.assertEqual(res.headers.get("access-control-allow-origin"), self.origin)
                self.assertIn("rate limited", res.json().get("detail", ""))

    def test_unexpected_backend_exception_global_handler(self):
        """Test unexpected Python exception is caught by global handler, returning 500 with CORS."""
        fake_user = {"_id": "test-user-123", "name": "Test User", "email": "test@example.com"}
        app.dependency_overrides[get_current_user] = lambda: fake_user

        with patch("app.routes.resume.database") as mock_db:
            mock_db.__getitem__.side_effect = RuntimeError("Simulated unhandled database crash")

            res = self.client.post("/api/resume/generate-questions", headers=self.headers)
            self.assertEqual(res.status_code, 500)
            self.assertEqual(res.headers.get("access-control-allow-origin"), self.origin)
            data = res.json()
            self.assertFalse(data.get("success", True))
            self.assertEqual(data.get("detail"), "An unexpected server error occurred. Please try again later.")

    def test_successful_question_generation(self):
        """Test successful question generation returns 200 with questions and CORS."""
        fake_user = {"_id": "test-user-123", "name": "Test User", "email": "test@example.com"}
        app.dependency_overrides[get_current_user] = lambda: fake_user

        mock_choice = MagicMock()
        mock_choice.message.content = "1. What is FastAPI?\n2. How does React state work?"
        mock_response = MagicMock()
        mock_response.choices = [mock_choice]

        with patch("app.routes.resume.database") as mock_db:
            mock_resumes = MagicMock()
            mock_resumes.find_one = AsyncMock(return_value={"_id": "r1", "extracted_text": "Python React Developer"})
            mock_db.__getitem__.return_value = mock_resumes

            with patch("app.services.groq_service.get_groq_client") as mock_get_client:
                mock_client = MagicMock()
                mock_client.chat.completions.create.return_value = mock_response
                mock_get_client.return_value = mock_client

                res = self.client.post("/api/resume/generate-questions", headers=self.headers)
                self.assertEqual(res.status_code, 200)
                self.assertEqual(res.headers.get("access-control-allow-origin"), self.origin)
                data = res.json()
                self.assertTrue(data.get("success"))
                self.assertIn("FastAPI", data.get("questions"))

    def test_evaluate_answer_groq_failure(self):
        """Test evaluate-answer handles Groq failure with controlled 502 and CORS."""
        fake_user = {"_id": "test-user-123", "name": "Test User", "email": "test@example.com"}
        app.dependency_overrides[get_current_user] = lambda: fake_user

        mock_request = httpx.Request("POST", "https://api.groq.com/openai/v1/chat/completions")

        with patch("app.services.evaluation_service.get_groq_client") as mock_get_client:
            mock_client = MagicMock()
            mock_client.chat.completions.create.side_effect = APIConnectionError(
                message="Connection timeout",
                request=mock_request
            )
            mock_get_client.return_value = mock_client

            payload = {
                "question": "What is JWT?",
                "answer": "JSON Web Token used for authentication."
            }
            res = self.client.post("/api/resume/evaluate-answer", headers=self.headers, json=payload)
            self.assertEqual(res.status_code, 502)
            self.assertEqual(res.headers.get("access-control-allow-origin"), self.origin)

    def test_evaluate_answer_success(self):
        """Test evaluate-answer successfully returns evaluation with score and CORS."""
        fake_user = {"_id": "test-user-123", "name": "Test User", "email": "test@example.com"}
        app.dependency_overrides[get_current_user] = lambda: fake_user

        mock_choice = MagicMock()
        mock_choice.message.content = "Score: 9/10\nStrengths: Clear explanation.\nWeaknesses: None.\nImproved Answer: Perfect."
        mock_response = MagicMock()
        mock_response.choices = [mock_choice]

        with patch("app.routes.resume.database") as mock_db:
            mock_interviews = MagicMock()
            mock_interviews.insert_one = AsyncMock(return_value=MagicMock(inserted_id="int_123"))
            mock_db.__getitem__.return_value = mock_interviews

            with patch("app.services.evaluation_service.get_groq_client") as mock_get_client:
                mock_client = MagicMock()
                mock_client.chat.completions.create.return_value = mock_response
                mock_get_client.return_value = mock_client

                payload = {
                    "question": "What is JWT?",
                    "answer": "JSON Web Token used for authentication."
                }
                res = self.client.post("/api/resume/evaluate-answer", headers=self.headers, json=payload)
                self.assertEqual(res.status_code, 200)
                self.assertEqual(res.headers.get("access-control-allow-origin"), self.origin)
                data = res.json()
                self.assertTrue(data.get("success"))
                self.assertEqual(data.get("score"), 9.0)
                self.assertIn("Score: 9/10", data.get("evaluation"))

    def test_model_configuration_used_consistently(self):
        """Test that llama-3.3-70b-versatile is passed to Groq for both questions and evaluation."""
        from app.config import GROQ_MODEL
        self.assertEqual(GROQ_MODEL, "llama-3.3-70b-versatile")

        fake_user = {"_id": "test-user-123", "name": "Test User", "email": "test@example.com"}
        app.dependency_overrides[get_current_user] = lambda: fake_user

        mock_choice = MagicMock()
        mock_choice.message.content = "1. Test question?"
        mock_response = MagicMock()
        mock_response.choices = [mock_choice]

        with patch("app.routes.resume.database") as mock_db:
            mock_resumes = MagicMock()
            mock_resumes.find_one = AsyncMock(return_value={"_id": "r1", "extracted_text": "Sample resume text"})
            mock_interviews = MagicMock()
            mock_interviews.insert_one = AsyncMock(return_value=MagicMock(inserted_id="int_123"))
            mock_db.__getitem__.side_effect = lambda key: mock_resumes if key == "resumes" else mock_interviews

            with patch("app.services.groq_service.get_groq_client") as mock_groq_client:
                client_instance = MagicMock()
                client_instance.chat.completions.create.return_value = mock_response
                mock_groq_client.return_value = client_instance

                # Test question generation model argument
                res_q = self.client.post("/api/resume/generate-questions", headers=self.headers)
                self.assertEqual(res_q.status_code, 200)
                call_args_q = client_instance.chat.completions.create.call_args
                self.assertEqual(call_args_q.kwargs.get("model"), "llama-3.3-70b-versatile")

            with patch("app.services.evaluation_service.get_groq_client") as mock_eval_client:
                eval_instance = MagicMock()
                eval_instance.chat.completions.create.return_value = mock_response
                mock_eval_client.return_value = eval_instance

                # Test evaluate answer model argument
                res_e = self.client.post(
                    "/api/resume/evaluate-answer",
                    headers=self.headers,
                    json={"question": "Test Q?", "answer": "Test A."}
                )
                self.assertEqual(res_e.status_code, 200)
                call_args_e = eval_instance.chat.completions.create.call_args
                self.assertEqual(call_args_e.kwargs.get("model"), "llama-3.3-70b-versatile")


if __name__ == "__main__":
    unittest.main()
