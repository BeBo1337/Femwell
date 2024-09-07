import { FC } from "react";
import "../assets/CarouselItem.css";
import { Text } from "@chakra-ui/react";

interface CarouselItemProps {
  label: string;
  image: string;
  buttonText: string;
  content: string;
  onClickFunction?: () => void;
}

const CarouselItem: FC<CarouselItemProps> = ({
  label,
  image,
  content,
  buttonText,
  onClickFunction,
}) => {
  return (
    <div className="carousel-item">
      <img className="carousel-image" src={image}></img>
      <div className="carousel-content">
        <div className="content-top">
          <h3>{label}</h3>
          <Text fontSize={"14px"}>{content}</Text>
        </div>
        <button onClick={() => (onClickFunction ? onClickFunction() : null)}>
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default CarouselItem;
