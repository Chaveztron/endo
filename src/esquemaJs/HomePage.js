import React, { useState, useRef, useEffect } from "react";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
//import "./HomePage.css";
import { Stage, Layer } from "react-konva";
import Circle from "./Circle";
import { addTextNode } from "./textNode";
import Image from "./Image";
const uuidv1 = require("uuid/dist/v1");
const photoId = uuidv1;

function HomePage({ dataImage, photo}) {
  const [num, setNum] = useState(1)
  const [circles, setCircles] = useState([]);
  const [images, setImages] = useState([{content: photo, photoId,}]);
  const [selectedId, selectShape] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [, updateState] = React.useState();
  const stageEl = React.createRef();
  const layerEl = React.createRef();
  const fileUploadEl = React.createRef();

  useEffect(()=>{
    dataImage(stageEl.current.getStage().toDataURL())
  })


  const getRandomInt = max => {
    return Math.floor(Math.random() * Math.floor(max));
  };

  const addCircle = () => {
    const circ = {
      x: getRandomInt(100),
      y: getRandomInt(100),
      width: 100,
      height: 100,
      stroke: "red",
      strokeWidth: 10,
      id: `circ${circles.length + 1}`,
    };
    const circs = circles.concat([circ]);
    setCircles(circs);
    const shs = shapes.concat([`circ${circles.length + 1}`]);
    setShapes(shs);
  };
  const drawText = () => {
    setNum(num+1)
    const id = addTextNode(stageEl.current.getStage(), layerEl.current, num);
    const shs = shapes.concat([id]);
    setShapes(shs);
  };
  const drawImage = () => {
    fileUploadEl.current.click();
  };
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const fileChange = ev => {
    let file = ev.target.files[0];
    let reader = new FileReader();
    reader.addEventListener(
      "load",
      () => {
        const id = uuidv1;
        images.push({
          content: reader.result,
          id,
        });
        setImages(images);
        fileUploadEl.current.value = null;
        shapes.push(id);
        setShapes(shapes);
        forceUpdate();
      },
      false
    );
    if (file) {
      reader.readAsDataURL(file);
    }
  };
  const undo = () => {
    const lastId = shapes[shapes.length - 1];
    let index = circles.findIndex(c => c.id == lastId);
    if (index != -1) {
      circles.splice(index, 1);
      setCircles(circles);
    }
    index = images.findIndex(r => r.id == lastId);
    if (index != -1) {
      images.splice(index, 1);
      setImages(images);
    }
    shapes.pop();
    setShapes(shapes);
    forceUpdate();
  };
  document.addEventListener("keydown", ev => {
    if (ev.code == "Delete") {
      let index = circles.findIndex(c => c.id == selectedId);
      if (index != -1) {
        circles.splice(index, 1);
        setCircles(circles);
      }
      index = images.findIndex(r => r.id == selectedId);
      if (index != -1) {
        images.splice(index, 1);
        setImages(images);
      }
      forceUpdate();
    }
  });

  const handleExportClick = () => {
    console.log(stageEl.current.getStage().toDataURL());
  }
  return (
    <div className="home-page" style={{width: 500, height: 500}}>
      <ButtonGroup>
        <Button variant="secondary" onClick={addCircle}>
          Circulo
        </Button>
        <Button variant="secondary" onClick={drawText}>
          Numero
        </Button>
        <Button variant="secondary" onClick={drawImage}>
          Imagen
        </Button>
        <Button variant="secondary" onClick={undo}>
          Undo
        </Button>
        <button onClick={handleExportClick}>
        Export stage
        </button>
      </ButtonGroup>
      <input
        style={{ display: "none" }}
        type="file"
        ref={fileUploadEl}
        onChange={fileChange}
      />
      <Stage
      style={{
        backgroundColor: "grey",
        borderRadius: "15px",
        overflow: 'hidden'
      }}
        width={500}
        height={500}
        ref={stageEl}
        onMouseDown={e => {
          // deselect when clicked on empty area
          const clickedOnEmpty = e.target === e.target.getStage();
          if (clickedOnEmpty) {
            selectShape(null);
          }
        }}
      >
        <Layer ref={layerEl}>

          {images.map((image, i) => {
            return (
              <Image
                key={i}
                imageUrl={image.content}
                isSelected={image.id === selectedId}
                onSelect={() => {
                  selectShape(image.id);
                }}
                onChange={newAttrs => {
                  const imgs = images.slice();
                  imgs[i] = newAttrs;
                }}
              />
            );
          })}

          {circles.map((circle, i) => {
            return (
              <Circle
                key={i}
                shapeProps={circle}
                isSelected={circle.id === selectedId}
                onSelect={() => {
                  selectShape(circle.id);
                }}
                onChange={newAttrs => {
                  const circs = circles.slice();
                  circs[i] = newAttrs;
                  setCircles(circs);
                }}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
export default HomePage;