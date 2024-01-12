from flask import Flask, jsonify, request
from app import app
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI()

# Endpoint for gpt chat
@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()



    messages = data["messages"]
    model = data["model"]
    maxTokens = data["maxTokens"]
    temperatur = data["temperature"]
    seed = data["seed"]
    stop = data["stop"]
    top_p = data["top_p"]
    frequency_penalty = data["frequency_penalty"]


    response = client.chat.completions.create(

        messages=messages,
        model=model,
        max_tokens=maxTokens,
        temperature=temperatur,
        top_p=top_p,
        frequency_penalty=frequency_penalty,
        stop=stop,
        seed=seed
    )





    return jsonify(response)
