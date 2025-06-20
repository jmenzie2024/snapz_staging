import Particles from "react-tsparticles";

import { loadFull } from "tsparticles";

const Paarticles = () => {
  const particlesInit = async (main) => {
    console.log(main);

    // you can initialize the tsParticles instance (main) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    await loadFull(main);
  };
  return (
    <>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: {
            enable: true,
            zIndex: -1,
          },
          particles: {
            number: {
              value: 15,
              density: {
                enable: true,
                value_area: 800,
              },
            },
            color: {
              value: "#000",
            },
            shape: {
              type: "circle",
              options: {
                sides: 5,
              },
            },
            opacity: {
              value: 0.3,
              random: true,
              anim: {
                enable: false,
                speed: 0.2,
                opacity_min: 0.1,
                sync: false,
              },
            },
            size: {
              value: 3,
              random: false,
              anim: {
                enable: false,
                speed: 15,
                size_min: 0.1,
                sync: false,
              },
            },
            rotate: {
              value: 0,
              random: true,
              direction: "clockwise",
              animation: {
                enable: true,
                speed: 1,
                sync: false,
              },
            },
            line_linked: {
              enable: true,
              distance: 300,
              color: "#000",
              opacity: 0.1,
              width: 2,
            },
            move: {
              enable: true,
              speed: 2,
              direction: "none",
              random: false,
              straight: false,
              out_mode: "out",
              attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200,
              },
            },
          },
          interactivity: {
            events: {
              onhover: {
                enable: false,
                mode: ["grab"],
              },
              onclick: {
                enable: false,
                mode: "bubble",
              },
              resize: true,
            },
            modes: {
              grab: {
                distance: 400,
                line_linked: {
                  opacity: 1,
                },
              },
              bubble: {
                distance: 400,
                size: 40,
                duration: 2,
                opacity: 8,
                speed: 3,
              },
              repulse: {
                distance: 200,
              },
              push: {
                particles_nb: 4,
              },
              remove: {
                particles_nb: 2,
              },
            },
          },
          retina_detect: true,
          background: {
            color: "#fff",
            image: "",
            position: "10% 10%",
            repeat: "no-repeat",
            size: "cover",
          },
        }}
      />
    </>
  );
};

export default Paarticles;
