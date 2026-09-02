import logging
from typing import Type, TypeVar, Optional
from pydantic import BaseModel
from openai import OpenAI, OpenAIError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from .config import settings

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

T = TypeVar('T', bound=BaseModel)

def get_client() -> Optional[OpenAI]:
    if not settings.OPENAI_API_KEY:
        logger.error("OPENAI_API_KEY is not set. LLM client cannot be initialized.")
        return None
    return OpenAI(api_key=settings.OPENAI_API_KEY)

# Retry logic: Retry on typical API errors up to 3 times, with exponential backoff
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(OpenAIError),
    reraise=True
)
def _call_openai_structured(client: OpenAI, system_prompt: str, user_prompt: str, schema: Type[T], model: str) -> T:
    response = client.beta.chat.completions.parse(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        response_format=schema
    )
    
    # The .parse method automatically validates and returns a Pydantic object
    return response.choices[0].message.parsed

def generate_structured_output(
    system_prompt: str, 
    user_prompt: str, 
    schema: Type[T], 
    model: str = settings.DEFAULT_MODEL
) -> T:
    """
    Calls the LLM and guarantees the output matches the provided Pydantic schema.
    """
    client = get_client()
    if not client:
        raise ValueError("Missing API Key: Cannot generate structured output.")

    try:
        logger.info(f"Generating structured output using model: {model}")
        result = _call_openai_structured(client, system_prompt, user_prompt, schema, model)
        logger.info("Successfully generated and validated structured output.")
        return result
    except OpenAIError as e:
        logger.error(f"LLM API Error after retries: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error parsing structured output: {str(e)}")
        raise e
