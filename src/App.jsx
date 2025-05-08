import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls, Environment } from '@react-three/drei'
import { Physics, useSphere } from '@react-three/cannon'
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import './index.css'
import { usePlane } from '@react-three/cannon'
import { Text } from '@react-three/drei'
import { motion } from "framer-motion"

// List of different scenarious and questions, as well as the verses from the Beatitudes which relate to them 
const questionPool = [
  {
    prompt: "Your friend forgets your birthday. It's now their birthday, wyd?",
    good: "Forgive them, move on, and get them a gift",
    evil: "Hold a grudge, ghost them on their birthday and skip out on their party",
    scripture: "Matthew 6:14 — If you forgive others their trespasses, your heavenly Father will also forgive you."
  },
  {
    prompt: "An old friend is talking mess about you and spreads a crazy rumor",
    good: "Give them grace and simply ignore it",
    evil: "Talk your own mess about them and spill all their business",
    scripture: "Matthew 5:44 — Love your enemies and pray for those who persecute you."
  },
  {
    prompt: "You lowkey got carried on a group project but the teacher shouts you out only, wyd?",
    good: "Admit that you didn't do much and give your team credit",
    evil: "Enjoy the spotlight, apologize to your friends later",
    scripture: "Matthew 5:37 — Let your ‘Yes’ be ‘Yes,’ and your ‘No,’ ‘No’."
  },
  {
    prompt: "Someone talks mess about you on Instagram",
    good: "Ignore and delete the message, they're trippin",
    evil: "Insult them and their mom",
    scripture: "Matthew 5:39 — If anyone slaps you on the right cheek, turn to them the other also."
  },
  {
    prompt: "A stranger is moving out and needs help lifting heavy boxes",
    good: "Help them out, you've got time",
    evil: "Pretend to be listening to music and ignore them",
    scripture: "Matthew 5:41 — If anyone forces you to go one mile, go with them two miles."
  },
  {
    prompt: "You're asked for help on a hard pset problem you spent 4 hours in office hours solving",
    good: "Help them out, you understand the struggle",
    evil: "you shoulda been at office hours too lol",
    scripture: "Matthew 5:42 — Give to the one who asks you, and do not turn away from the one who wants to borrow from you."
  },
  {
    prompt: "You make fun of your friend behind their back and they hear about it",
    good: "Say sorry and stop doing it",
    evil: "Call them a fool for believing such a lie",
    scripture: "Matthew 5:22 — Anyone who says, ‘You fool!’ will be in danger of the fire of hell."
  },
  {
    prompt: "You're lowkey angry at your friend for something they did a few days ago.",
    good: "Reach out to them to let them know how you feel and offer peace",
    evil: "Ghost them and spread your side to others",
    scripture: "Matthew 5:23–24 — First be reconciled to your brother, and then come and offer your gift."
  },
  {
    prompt: "You put off studying for a test, but you have the chance to cheat off the person in front of you who you know goes to all office hours and has read the textbook.",
    good: "Accept tha you're cooked and answer whatever you can and hope for the best",
    evil: "Cheat off the person in front of you the entire test",
    scripture: "Matthew 5:8 — Blessed are the pure in heart, for they will see God."
  },
  {
    prompt: "You want to pray but only because others are watching.",
    good: "Pray privately from the heart",
    evil: "Make a show of it for attention",
    scripture: "Matthew 6:6 — When you pray, go into your room and shut the door."
  },
  {
    prompt: "During lent, you decide to give up sweets and you decide to go to your friend's birthday party where they're serving cake and ice cream. What do you do when offered cake and ice cream?",
    good: "Keep your fast private and nicely decline the cake and ice cream",
    evil: "Tell everyone how you gave up sweets for Lent and how much it sucks and you wish you could have the cake and ice cream",
    scripture: "Matthew 6:17–18 — When you fast... do not show it to others, but to your Father."
  },
  {
    prompt: "You just won the lottery, what do you buy first?",
    good: "Give to a charity or someone in need",
    evil: "Buy a lamboooo",
    scripture: "Matthew 6:19 — Do not store up for yourselves treasures on earth."
  },
  {
    prompt: "You're hating on someone's fit just cause",
    good: "Stop it, who are you to be hating on their fit",
    evil: "Keep judging and tell your friend to hate too",
    scripture: "Matthew 7:1 — Do not judge, or you too will be judged."
  },
  {
    prompt: "You found $1000 outside of the science center, wyd?",
    good: "Turn in wallet and let try to track down the owner",
    evil: "Everybody eating good today :D",
    scripture: "Matthew 6:21 — For where your treasure is, there your heart will be also."
  },
  {
    prompt: "You're lowkey losing an argument, wyd?",
    good: "Calm down and admit defeat",
    evil: "Yell and try to be louder than your friend",
    scripture: "Matthew 5:5 — Blessed are the meek, for they will inherit the earth."
  },
  {
    prompt: "You're anxious about something that's going to happen in a few months",
    good: "Trust it'll all be fine and go on about your day",
    evil: "Let the voices overcome you and become severely anxious ",
    scripture: "Matthew 6:34 — Do not worry about tomorrow, for tomorrow will worry about itself."
  },
  {
    prompt: "Your friend is in an argument with another friend, wyd?",
    good: "Tell them to stop and remind them we are all friends",
    evil: "Join in and attack one friend",
    scripture: "Matthew 5:9 — Blessed are the peacemakers, for they shall be called children of God."
  },
  {
    prompt: "Youre friend lowkey just did you wrong but you see them walking by alone as you're hanging out with friends",
    good: "Invite them to join or walk with them",
    evil: "Ignore them and stick to your own group",
    scripture: "Matthew 5:7 — Blessed are the merciful, for they will be shown mercy."
  },
  {
    prompt: "You hear someone celebrating the internship they just got",
    good: "Congratulate them and be happy",
    evil: "Show off your internship in NYC that pays $100/hr",
    scripture: "Matthew 6:1 — Do not practice your righteousness in front of others to be seen by them."
  },
  {
    prompt: "You see someone else getting the credit for your work in a group project.",
    good: "Let it go and be at peace",
    evil: "Demand credit and let everyone know that it was your work",
    scripture: "Matthew 5:10 — Blessed are those who are persecuted for righteousness’ sake, for theirs is the kingdom of heaven."
  }
];

// Randomly selecting 3 scenarious from the list of them 
function getRandomQuestions(pool, count = 3) {
  const seen = new Set()
  const unique = []

  const shuffled = [...pool].sort(() => 0.5 - Math.random())

  for (const q of shuffled) {
    if (!seen.has(q.prompt)) {
      unique.push(q)
      seen.add(q.prompt)
    }
    if (unique.length === count) break
  }

  return unique
}


// Creating the floor like platform which the player stands on 
function Platform() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0], // flat horizontal plane
    position: [0, .01, 0], // y = 0
  }))

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#222" emissive="#1a1a1a" emissiveIntensity={0.5} />
    </mesh>
  )
}

// Those creepy lights at the top (they're really just white blocks lol)
function BlinkingLight({ position }) {
  const lightRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const intensity = 1.5 + Math.sin(t * 4 + position[2]) * 0.8 // offset each light
    lightRef.current.material.emissiveIntensity = intensity
  })

  return (
    <mesh position={position} ref={lightRef}>
      <boxGeometry args={[3, 0.2, 0.5]} />
      <meshStandardMaterial emissive="white" />
    </mesh>
  )
}

// The platform which user runs on to make decisions that are prompted , left hallway right hallway and hallway where we spawn
function Hallway({ goodText = "GOOD", evilText = "EVIL" }) {
  return (
    <>
      {/* Main forward floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 20]} />
        <meshStandardMaterial color="#AAAAAA" />
      </mesh>

      {/* Left path floor */}
      <mesh position={[-7.5, 0, 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#AAAAAA" />
      </mesh>

      {/* Right path floor */}
      <mesh position={[7.5, 0, 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#AAAAAA" />
      </mesh>

      {/*Walls */}
      <mesh position={[-6.5, 2, 0]}>
        <boxGeometry args={[0.5, 4, 20]} />
      </mesh>
      <mesh position={[6.5, 2, 0]}>
        <boxGeometry args={[0.5, 4, 20]} />
      </mesh>

      <mesh position={[-9.5, 0, 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
      </mesh>
      <mesh position={[9.5, 0, 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
      </mesh>

      {/* Back wall (behind player spawn) */}
      <mesh position={[0, 2, -10]}>
        <boxGeometry args={[10, 4, 0.5]} />
        <meshStandardMaterial color="#AAAAAA" />
      </mesh>

      {/* Blinking ceiling lights down center */}
      {[0, 5, 10].map((z, i) => (
        <BlinkingLight key={i} position={[0, 4, z]} />
      ))}

      {/* Glowing aura behind GOOD */}
      <mesh position={[-7.5, 3, 14.9]}>
        <planeGeometry args={[8, 2]} />
        <meshBasicMaterial color="green" transparent opacity={0.2} />
      </mesh>

      {/* Glowing aura behind EVIL */}
      <mesh position={[7.5, 3, 14.9]}>
        <planeGeometry args={[8, 2]} />
        <meshBasicMaterial color="red" transparent opacity={0.2} />
      </mesh>

      {/* GOOD sign on the left */}
      <Text
  position={[-7.5, 3, 15]}
      fontSize={0.25}
      color="green"
      maxWidth={6}     
      lineHeight={1.3}  
      rotation={[0, Math.PI, 0]}
      anchorX="center"
      anchorY="middle"
    >
  {goodText}
</Text>

<Text
  position={[7.5, 3, 15]}
  fontSize={0.25}
  color="red"
  maxWidth={6}
  lineHeight={1.3}
  rotation={[0, Math.PI, 0]}
  anchorX="center"
  anchorY="middle"
>
  {evilText}
</Text>



    </>
  )
}



// I orginally added this orb to test the 3d components and capabilities of javascript, and decided to keep it as a nice touch, think of it as the user's brain 
function Orb({ playerPosition }) {
  const meshRef = useRef()
  const [intensity, setIntensity] = useState(0.5)

  useFrame(() => {
    const dist = meshRef.current.position.distanceTo(playerPosition.current)
    setIntensity(THREE.MathUtils.clamp(2 - dist, 0.5, 2))
    meshRef.current.material.emissiveIntensity = intensity
  })

  return (
    <mesh position={[0, 0, 0]} ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="white" emissive="white" />
    </mesh>
  )
}

// Main functions for player, first person pov as well as how the player moves 
function Player({ positionRef, handleChoice }) {
  const { camera } = useThree()
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: [0, 1.5, 5],
    args: [0.5],
  }))

  const keys = useRef({})
  

  useEffect(() => {
    const handleKeyDown = (e) => (keys.current[e.code] = true)
    const handleKeyUp = (e) => (keys.current[e.code] = false)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])
  // movement of player 
  useFrame(() => {
    const direction = new THREE.Vector3()
    const front = new THREE.Vector3()
    const side = new THREE.Vector3()

    const w = keys.current['KeyW'] ? 1 : 0
    const s = keys.current['KeyS'] ? 1 : 0
    const a = keys.current['KeyA'] ? 1 : 0
    const d = keys.current['KeyD'] ? 1 : 0

    camera.getWorldDirection(front)
    front.y = 0
    front.normalize()

    side.crossVectors(front, camera.up).normalize()

    direction
      .add(front.clone().multiplyScalar(w - s))
      .add(side.clone().multiplyScalar(d - a))
      .normalize()
      .multiplyScalar(1.5)

    api.velocity.set(direction.x, 0, direction.z)

    if (ref.current) {
      ref.current.getWorldPosition(camera.position)
      positionRef.current.copy(camera.position)

      const z = camera.position.z
      const x = camera.position.x

      if (z > 17 && x < -5) {
        handleChoice("good")
      }
      if (z > 17 && x > 5) {
        handleChoice("evil")
      }
    }
  })

  return <mesh ref={ref} />
}

// YAY ! Heaven , this is the final recap screen after user decides their fate 
function HeavenScene() {
  return (
    <>
      <ambientLight intensity={1} />
      <pointLight position={[0, 5, 0]} intensity={2} color="white" />
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#e0f7fa" />
      </mesh>

      <mesh position={[0, 2, -5]}>
        <torusGeometry args={[2, 0.5, 16, 100]} />
        <meshStandardMaterial color="gold" emissive="gold" />
      </mesh>

      <Text position={[0, 5, -5]} fontSize={1} color="white" anchorX="center">
        WELCOME
      </Text>
    </>
  )
}

// NO :( , user in hell , end game screen with fate 
function HellScene() {
  return (
    <>
      <color attach="background" args={["#1a0000"]} />
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 5, 0]} intensity={3} color="red" />
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#330000" />
      </mesh>

      <mesh position={[0, 5, -10]}>
        <boxGeometry args={[10, 10, 1]} />
        <meshStandardMaterial color="black" emissive="darkred" />
      </mesh>

      <Text position={[0, 10, -10]} fontSize={1.5} color="red" anchorX="center">
        THE BOOK IS CLOSED
      </Text>
    </>
  )
}

// Main logic that is used to run the actual game, here we track the score, make the transitions from scenario to scenario happen, as well as prompting new questions and everything that brings the game to life
function App() {

  // A million state variables lol 
  // Tracking the user's choice as good or evil
  const [choice, setChoice] = useState(null);

  // Keeping score of how many evil or good the user has chosen 
  const [score, setScore] = useState({ good: 0, evil: 0 });

  // Track user's position so we know when they've crossed a path and made a decision
  const playerPosRef = useRef(new THREE.Vector3());

  // Index of question being asked 
  const [questionIndex, setQuestionIndex] = useState(0);

  // Restart button "press enter"
  const [showRestart, setShowRestart] = useState(false);

  // Used to show the question on center of screen 
  const [showCenterPrompt, setShowCenterPrompt] = useState(true);

  // Array of our random questions 
  const [questions, setQuestions] = useState(() => getRandomQuestions(questionPool));

  // Logging user choices 
  const [history, setHistory] = useState([]);

  // current question from the 3 chosen
  const currentQuestion = questions[questionIndex];
  
  // tracks when all 3 questions have been answered 
  const isFinished = questionIndex === questions.length;

  // USER's FATE 
  const isHeaven = score.good > score.evil;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && showRestart) {
        setScore({ good: 0, evil: 0 });
        setChoice(null);
        setQuestionIndex(0);
        setShowRestart(false);
        setQuestions(getRandomQuestions(questionPool, Math.min(questionPool.length, 3)));
        setHistory([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showRestart]);

  useEffect(() => {
    if (questionIndex < questions.length) {
      setShowCenterPrompt(true);
      const timer = setTimeout(() => setShowCenterPrompt(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [questionIndex]);

  function handleChoice(type) {
    const current = questions[questionIndex];
    setHistory((prev) => [...prev, { ...current, chosen: type }]);
    setScore((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    setChoice(type);

    setTimeout(() => {
      setChoice(null);
      setQuestionIndex((prev) => {
        const next = prev + 1;
        if (next === questions.length) {
          setTimeout(() => setShowRestart(true), 20000);
        }
        return next;
      });
    }, 1500);
  }

  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden">

      {!isFinished && questionIndex < questions.length && !showCenterPrompt && (
        <div className="absolute top-4 w-full text-center text-white text-xl font-semibold z-20">
          <p>Question {questionIndex + 1} of {questions.length}</p>
          <p className="text-2xl">{currentQuestion.prompt}</p>
        </div>
      )}

      {!isFinished && showCenterPrompt && (
        <motion.div className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold z-20"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
          {currentQuestion?.prompt}
        </motion.div>
      )}

      {isFinished && (
        <div
          className={`absolute inset-0 z-10 overflow-y-auto px-4 py-10 flex flex-col items-center transition-colors duration-500 ${
            isHeaven ? 'bg-gradient-to-b from-white/10 to-blue-900' : 'bg-gradient-to-b from-black to-red-950'
          }`}
        >
          <h1 className="text-5xl font-bold text-white mb-8">
            {isHeaven ? 'HEAVEN :)' : 'HELL :('}
          </h1>
          <div className="w-[90%] max-w-3xl space-y-6 text-black">
            {history.map((entry, idx) => (
              <div
                key={idx}
                className={`p-4 rounded shadow ${
                  entry.chosen === 'good' ? 'bg-green-100' : 'bg-red-200'
                }`}
              >
                <p className="font-semibold">Q{idx + 1}: {entry.prompt}</p>
                <p>
                   You chose: <span className={entry.chosen === 'good' ? 'text-green-700' : 'text-red-700'}>
                    {entry[entry.chosen]}
                  </span>
                </p>
                <p className="italic text-sm mt-2">Scripture: {entry.scripture}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Canvas camera={{ fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 5, 5]} intensity={2} />
        {isFinished ? (
          isHeaven ? <HeavenScene /> : <HellScene />
        ) : (
          <>
            <Physics>
              {choice === null && (
                <>
                  <Hallway goodText={currentQuestion?.good} evilText={currentQuestion?.evil} />
                  <Platform />
                  <Player positionRef={playerPosRef} handleChoice={handleChoice} />
                </>
              )}
            </Physics>
            {choice === null && <Orb playerPosition={playerPosRef} />}
          </>
        )}
        <PointerLockControls />
        <Environment preset="night" />
      </Canvas>

      {showRestart && (
        <div className="absolute bottom-20 w-full text-center text-white text-2xl font-bold z-20">
          Press <span className="text-yellow-400">Enter</span> to play again
        </div>
      )}
      <p className="absolute bottom-10 w-full text-center text-white text-lg animate-pulse z-20">
        Click to enter — use WASD to move around
      </p>
    </div>
  );
}

export default App;