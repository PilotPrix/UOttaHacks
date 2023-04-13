import React, { useRef, useState, useEffect } from "react"
import * as tf from "@tensorflow/tfjs"
import * as handpose from "@tensorflow-models/handpose"
import Webcam from "react-webcam"
import { drawHand } from "../components/handposeutil"
import * as fp from "fingerpose"
import Handsigns from "../components/handsigns"

import {
  Text,
  Heading,
  Button,
  Image,
  Stack,
  Container,
  Box,
  VStack,
  ChakraProvider,
} from "@chakra-ui/react"

import { Signimage, Signpass } from "../components/handimage"

import Metatags from "../components/metatags"

// import "../styles/App.css"

// import "@tensorflow/tfjs-backend-webgl"

import { RiCameraFill, RiCameraOffFill } from "react-icons/ri"

export default function Live() {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)

  const [camState, setCamState] = useState("on")

  const [sign, setSign] = useState(null)


  const [word, addWord] = useState('')
  let testWord = ""
  let freeze = ""
  let timer = 0;
  let realtimer = 0;

  let flag = false;

  let signList = []
  let currentSign = 0

  let gamestate = "started"



  // Runs once
  async function runHandpose() {
    const net = await handpose.load()
    _signList(false)

    // window.requestAnimationFrame(loop);

    setInterval(() => {
      detect(net)
    }, 100)
  }

  // Used to shuffle the hand image list and store it to "signList"
  function _signList(random) {
    // Generate signs
    if (random) {
      signList = shuffle(Signpass)
    }
    else {
      signList = Signpass
    }
  }

  async function detect(net) {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video
      const videoWidth = webcamRef.current.video.videoWidth
      const videoHeight = webcamRef.current.video.videoHeight

      // Set video width
      webcamRef.current.video.width = videoWidth
      webcamRef.current.video.height = videoHeight

      // Set canvas height and width
      canvasRef.current.width = videoWidth
      canvasRef.current.height = videoHeight

      // Make Detections
      const hand = await net.estimateHands(video)

      // If hand detected
      if (hand.length > 0) {
        realtimer = 0;
        flag = true;
        //loading the fingerpose model
        const GE = new fp.GestureEstimator([
          fp.Gestures.ThumbsUpGesture,
          Handsigns.aSign,
          Handsigns.bSign,
          Handsigns.cSign,
          Handsigns.dSign,
          Handsigns.eSign,
          Handsigns.fSign,
          Handsigns.gSign,
          Handsigns.hSign,
          Handsigns.iSign,
          Handsigns.jSign,
          Handsigns.kSign,
          Handsigns.lSign,
          Handsigns.mSign,
          Handsigns.nSign,
          Handsigns.oSign,
          Handsigns.pSign,
          Handsigns.qSign,
          Handsigns.rSign,
          Handsigns.sSign,
          Handsigns.tSign,
          Handsigns.uSign,
          Handsigns.vSign,
          Handsigns.wSign,
          Handsigns.xSign,
          Handsigns.ySign,
          Handsigns.zSign,
        ])

        const estimatedGestures = await GE.estimate(hand[0].landmarks, 6.5)
        // document.querySelector('.pose-data').innerHTML =JSON.stringify(estimatedGestures.poseData, null, 2);

        if (gamestate === "started") {
          document.querySelector("#app-title").innerText = ""
        }

        if (
          estimatedGestures.gestures !== undefined &&
          estimatedGestures.gestures.length > 0
        ) {
          const confidence = estimatedGestures.gestures.map(p => p.confidence)
          const maxConfidence = confidence.indexOf(
            Math.max(...confidence)
          )

          //setting up game state, looking for thumb emoji
          if (
            estimatedGestures.gestures[maxConfidence].name === "thumbs_up" &&
            gamestate !== "played"
          ) {
            _signList(false)
            gamestate = "played"
            document.getElementById("emojimage").classList.add("play")
            document.querySelector(".tutor-text").innerText =
              "make a hand gesture based on letter shown below"
          } else if (gamestate === "played") {
            document.querySelector("#app-title").innerText = ""

            //test making words
            timer++;
            // If the current sign is not the same as previous
            if (estimatedGestures.gestures[maxConfidence].name != freeze && timer > 10) {
              timer = 0;
              freeze = estimatedGestures.gestures[maxConfidence].name;
              //addWord(word+estimatedGestures.gestures[maxConfidence].name)
              testWord += estimatedGestures.gestures[maxConfidence].name;
              addWord(testWord)
              console.log(testWord)
            }


            //game play state

            if (
              // Check if "signList[currentSign].src.src" is a string literal or string object
              typeof signList[currentSign].src.src === "string" ||
              signList[currentSign].src.src instanceof String
            ) {
              // Change the image of the sign emoji using "signList[currentSign].src.src"
              document.getElementById("emojimage").setAttribute("src", signList[currentSign].src.src)
              // If the detected gestures is the same as the displayed sign image
              if (
                signList[currentSign].alt ===
                estimatedGestures.gestures[maxConfidence].name
              ) {
                currentSign++
              }
              setSign(estimatedGestures.gestures[maxConfidence].name)
            }
          } else if (gamestate === "finished") {
            return
          }
        }
      }
      // If no hand detected
      else {
        console.log('no hands')
        realtimer++;
        // 5 seconds after no hands, add space
        if ((realtimer % 5 == 0) && flag) {
          flag = false;
          realtimer = 0;
          console.log('space')
          testWord += " "
          addWord(testWord);
        }
      }
      // Draw hand lines
      const ctx = canvasRef.current.getContext("2d")
      drawHand(hand, ctx)
    }
  }

  useEffect(() => {
    runHandpose()
  }, [])

  function switchCameraState() {
    if (camState === "on") {
      setCamState("off")
    } else {
      setCamState("on")
    }
  }

  return (
    <ChakraProvider>
      <Metatags />
      <Box bgColor="#5784BA">
        <Container centerContent maxW="xl" height="100vh" pt="0" pb="0">
          <VStack spacing={4} align="center">
            <Box h="20px"></Box>
            <Heading
              as="h3"
              size="md"
              className="tutor-text"
              color="white"
              textAlign="center"
            ></Heading>
            <Box h="20px"></Box>
          </VStack>

          <Heading
            as="h1"
            size="lg"
            id="app-title"
            color="white"
            textAlign="center"
          >
            Live translation Model
          </Heading>



          <Box id="webcam-container">
            {/* The camera background */}
            {camState === "on" ? (
              <Webcam id="webcam" ref={webcamRef} />
            ) : (
              <div id="webcam" background="black"></div>
            )}

            {/* Detected Sign letter at the bottom */}
            {sign ? (
              <div
                style={{
                  position: "absolute",
                  marginLeft: "auto",
                  marginRight: "auto",
                  right: "calc(50% - 50px)",
                  bottom: 100,
                  textAlign: "-webkit-center",
                }}
              >
                <Text color="white" fontSize="sm" mb={1}>
                  detected gestures
                </Text>
                <img
                  alt="signImage"
                  src={
                    Signimage[sign]?.src
                      ? Signimage[sign].src
                      : "/loveyou_emoji.svg"
                  }
                  style={{
                    height: 30,
                  }}
                />
              </div>
            ) : (
              " "
            )}
          </Box>

          <canvas id="gesture-canvas" ref={canvasRef} style={{}} />

          <Box
            id="singmojix"
            style={{
              zIndex: 9,
              position: "fixed",
              top: "50px",
              right: "30px",
            }}
          ></Box>


          <Image h="150px" objectFit="cover" id="emojimage" style={{ visibility: "hidden" }} />


          {/* <pre className="pose-data" color="white" style={{position: 'fixed', top: '150px', left: '10px'}} >Pose data</pre> */}
        </Container>



        <Stack id="start-button" spacing={4} direction="row" align="center">
          <Container centerContent>
            <Heading
              id='cc'
              style={{
                color: "black",
                zIndex: 10
              }}>

              {word}

            </Heading>
          </Container>


        </Stack>
      </Box>
    </ChakraProvider>
  )
}