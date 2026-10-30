FROM python:3.13-slim
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install --no-cache-dir uv==0.13.1 && uv sync --frozen --no-dev
COPY apps/api apps/api
COPY specs/cvd-studio specs/cvd-studio
ENV PYTHONPATH=/app/apps/api/src
ENV PATH=/app/.venv/bin:$PATH
RUN useradd --uid 10001 --create-home cvd
USER cvd
EXPOSE 8000
CMD ["python","-m","uvicorn","cvd_studio.main:app","--host","0.0.0.0","--port","8000","--no-proxy-headers"]
