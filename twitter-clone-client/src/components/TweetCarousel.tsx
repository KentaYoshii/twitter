import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";

const TweetCarousel = (props: {images: string[]}) => {
  return (
    <Carousel showThumbs={false}>
      {props.images.map((image, idx) => (
        <div key={idx}>
          <img src={image} alt="" />
        </div>
      ))}
    </Carousel>
  );
};

export default TweetCarousel