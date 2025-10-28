FROM python:3.14

WORKDIR api/
COPY . .
EXPOSE 8000

RUN python -m pip install --upgrade pip
RUN pip install -r requirements.txt

CMD ["fastapi", "dev", "api/api/main.py", "--host", "0.0.0.0", "--port", "8000"]
