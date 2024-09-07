import { useState, useEffect, FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Carousel from "react-multi-carousel";
import CarouselItem from "./CarouselItem";
import "react-multi-carousel/lib/styles.css";
import "../assets/Carousel.css";
import { faCircleArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faCircleArrowRight } from "@fortawesome/free-solid-svg-icons/faCircleArrowRight";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useShowToast from "../hooks/useShowToast";

interface CarouselProps {
  label?: string;
}

const CarouselComponent: FC<CarouselProps> = ({}) => {
  const authUser = useAuthStore((state) => state.user);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const showToast = useShowToast();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const responsive = {
    ultraLargeDesktop: {
      breakpoint: { max: 4000, min: 1625 },
      items: 6,
    },
    largeDesktop: {
      breakpoint: { max: 1625, min: 1200 },
      items: 5,
    },
    mediumDesktop: {
      breakpoint: { max: 1200, min: 1024 },
      items: 4,
    },
    smallDesktop: {
      breakpoint: { max: 1000, min: 700 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 700, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  const goToZen = () => {
    if (authUser) {
      authUser.role !== "User"
        ? navigate("/zen")
        : showToast("Unauthorized", "This is a premium feature", "info", "zen");
    } else {
      showToast("Error", "Please log in to use this feature", "error", "zen");
    }
  };

  const goToCommunity = () => {
    navigate("/community");
  };

  const goToION = () => {
    navigate("/ION");
  };

  const goToChat = () => {
    showToast("Error", "Please log in to use this feature", "error", "zen");
  };
  const carouselItems = [
    {
      label: "Reach Zen",
      content:
        "Come and check out our amazing expertly made video gallery tailored just for you!",
      image: "/ForYou1.png",
      buttonText: "Join Here",
      onClickFunction: goToZen,
    },
    {
      label: "Our Community",
      content:
        "Jump into our vibrant community and share your journey! Connect, inspire, and grow together.",
      image: "/ForYou2.png",
      buttonText: "Click Here",
      onClickFunction: goToCommunity,
    },
    {
      label: "Online Notebook",
      content:
        "Explore our article section and find expert insights about your process",
      image: "/Article5.png",
      buttonText: "Read More",
      onClickFunction: goToION,
    },
    {
      label: "Expert LiveChat",
      content:
        "Feeling lost or distressed? Start a live chat session with one of our Padullas and let us assist you!",
      image: "/ForYou5.png",
      buttonText: "Start Now",
      onClickFunction: goToChat,
    },
    {
      label: "Femwell Podcast",
      content:
        "We are excited to annouce we will start our very own Podcast soon! Available on Femwell & Spotify!",
      image: "/Podcast.png",
      buttonText: "Coming Soon",
    },
    {
      label: "Femwell Experts",
      content:
        "Schedule a doctor checkup with one of our experts for medical assesment and questions",
      image: "/ForYou6.png",
      buttonText: "Coming Soon",
    },
  ];

  const CustomLeftArrow: FC = (props: any) => {
    const { onClick } = props;
    return (
      <button className="left-arrow" onClick={onClick}>
        <FontAwesomeIcon icon={faCircleArrowLeft} />
      </button>
    );
  };

  const CustomRightArrow: FC = (props: any) => {
    const { onClick } = props;
    return (
      <button className="right-arrow" onClick={onClick}>
        <FontAwesomeIcon icon={faCircleArrowRight} />
      </button>
    );
  };

  return (
    <div className="carousel-wrapper">
      <Carousel
        responsive={responsive}
        infinite={true}
        autoPlay={windowWidth < 500 ? true : false}
        autoPlaySpeed={2500}
        containerClass="carousel-container"
        customLeftArrow={<CustomLeftArrow />}
        customRightArrow={<CustomRightArrow />}
        renderButtonGroupOutside={true}
      >
        {carouselItems.map((item, index) => (
          <CarouselItem
            key={index}
            label={item.label}
            content={item.content}
            image={item.image}
            buttonText={item.buttonText}
            onClickFunction={item.onClickFunction}
          />
        ))}
      </Carousel>
    </div>
  );
};
export default CarouselComponent;
