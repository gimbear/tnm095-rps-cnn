import React, { useEffect, useState, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";

//const WebcamComponent = () => <Webcam />;

function App() {
  const classes = ["rock", "paper", "scissors"];
  const webcamRef = React.useRef(null);
  const [imgSrc, setImgSrc] = React.useState(null);

  const [userChoice, setUserChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState(null);
  const choices = ["rock", "paper", "scissors"];

  const handleClick = (value) => {
    setUserChoice(value);
    generateComputerChoice();
  };

  const generateComputerChoice = () => {
    const randomChoice = choices[Math.floor(Math.random() * choices.length)];
    setComputerChoice(randomChoice);
  };

  useEffect(() => {
    {
      switch (userChoice + computerChoice) {
        case "scissorspaper":
        case "rockscissors":
        case "paperrock":
          setResult("YOU WIN!");
          break;
        case "paperscissors":
        case "scissorsrock":
        case "rockpaper":
          setResult("YOU LOSE!");
          break;
        case "rockrock":
        case "paperpaper":
        case "scissorsscissors":
          setResult("ITS A DRAW!");
          break;
      }
    }
  }, [computerChoice, userChoice]);

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef, setImgSrc]);

  const [model, setModel] = useState();

  async function loadModel() {
    try {
      const model = await tf.loadLayersModel(
        process.env.PUBLIC_URL + "/model/model.json"
      );
      setModel(model);
      console.log("successfully loaded model...");
    } catch (err) {
      console.log(err);
      console.log("failed loading model...");
    }
  }
  useEffect(() => {
    tf.ready().then(() => {
      loadModel();
    });
  }, []);

  async function getFrame() {
    const pred = preprocess(document.getElementById("img"));

    const prediciton = model.predict(pred).dataSync();

    return getResults(prediciton);
  }
  function preprocess(imgData) {
    return tf.tidy(() => {
      //convert to a tensor

      let tensor = tf.browser.fromPixels(imgData, 3);
      //resize
      //console.log(tensor);

      const resize = tf.image.resizeBilinear(tensor, [150, 150]).toFloat();
      // // //normalize
      // console.log(resize);
      const offset = tf.scalar(255.0);
      // console.log(offset);
      const normalized = tf.scalar(1.0).sub(resize.div(offset));
      // console.log(normalized);
      //
      // //We add a dimension to get a batch shape
      return normalized.expandDims(0);
    });
  }

  function getResults(prediction) {
    let result = prediction.indexOf(Math.max(...prediction));

    let data = [
      {
        title: "Rock",
        value: prediction[0].toFixed(2) * 100,
      },
      {
        title: "Paper",
        value: prediction[1].toFixed(2) * 100,
      },
      {
        title: "Scissor",
        value: prediction[2].toFixed(2) * 100,
      },
    ];

    console.log(
      classes[result] + ": " + prediction[result].toFixed(2) * 100 + "%"
    );

    let content = document.getElementById("prediction");
    content.innerHTML =
      data[0].title +
      ": " +
      data[0].value +
      "% " +
      data[1].title +
      ": " +
      data[1].value +
      "% " +
      data[2].title +
      ": " +
      data[2].value +
      "%";

    console.log(result);
    handleClick(choices[result]);
    return data;
  }

  return (
    <>
      <div style={{ position: "absolute", top: "200px", left: "30px" }}>
        <Webcam
          id="img"
          audio={false}
          ref={webcamRef}
          screenshotQuality={0.1}
          screenshotFormat="image/jpeg"
        />
      </div>
      <button
        style={{
          position: "absolute",
          top: "380px",
          padding: "50px 38px",
          "border-radius": "8px",
          left: "700px",
          "font-size": "40px",
        }}
        onClick={function (event) {
          capture();
          getFrame();
          //handleClick(choice);
        }}
      >
        Predict
      </button>
      <div>
        {imgSrc && (
          <img
            id="myImage"
            src={imgSrc}
            style={{
              position: "absolute",
              width: "200px",
              top: "200px",
              left: "700px",
            }}
          />
        )}
      </div>

      <div
        style={{ position: "absolute", top: "210px", left: "40px" }}
        id="prediction"
      ></div>

      <div style={{ position: "absolute", top: "25px", left: "30px" }}>
        <div>
          <h1>Your choice is: {userChoice}</h1>
          <h1>Computer choice is: {computerChoice}</h1>

          <h1
            style={{
              position: "absolute",
              top: "-10px",
              left: "480px",
              width: "520px",
              color: "rgb(255,153,82)",
              "font-size": "60px",
            }}
          >
            {result}
          </h1>
        </div>
      </div>
    </>
  );
}

export default App;
