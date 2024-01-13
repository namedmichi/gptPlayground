from flask import Flask, jsonify, request, make_response
from app import app
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key="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")

# Endpoint for gpt chat
@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()



    messages = data["messages"]
    model = data["model"]
    maxTokens = int(data["maxTokens"])
    temperatur = float(data["temperature"])
    stop = data["stop"] if data["stop"] else None
    top_p = data["top_p"] if data["top_p"] else 1
    frequency_penalty = data["frequency_penalty"] if data["frequency_penalty"] else 0
    seed = data["seed"] if data["seed"] else None
    

    if(seed == None):
        response = client.chat.completions.create(

            messages=messages,
            model=model,
            max_tokens=maxTokens,
            temperature=temperatur,
            top_p=top_p,
            frequency_penalty=frequency_penalty,
            stop=stop
        )
    else:
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

    text = response.choices[0].message.content

    response = make_response(jsonify(text), 200)
   
    return response
