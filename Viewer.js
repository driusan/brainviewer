import React from 'react';
import { View, Text } from 'react-native';
import { GLView } from 'expo-gl';
import Expo2DContext from "expo-2d-context";
import { SegmentSlider } from './SegmentSlider';


export class Viewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataview: null,
            sliderValue: 0,
            maxVal: 0,
        };

        if (props.headers) {
            if (props.headers.datatype === "float32") {
                const dv = new Float32Array(this.props.rawData);
                this.setState({
                    dataview: dv,
                    maxVal: props.headers.zspace ? props.headers.zspace.space_length : 0,
                });
                console.log("new dataview");
            } else {
                console.log("unhandled datatype");
            }
        } else {
            console.log('No headers');
        }
        this.onContextCreate = this.onContextCreate.bind(this); // Bind the method to the correct context
    }

    handleSliderChange = (newValue) => {
        this.setState({ sliderValue: newValue });
    };

    render() {
        if( !this.props.headers) {
            return <View><Text>Loading headers..</Text></View>;
        }
        if (!this.props.rawData){
            return <View><Text>Loading raw data..</Text></View>
        }
        var maxVal = 100;
        if (this.props.headers.zspace) {
            maxVal = this.props.headers.zspace.space_length;
        }

        return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <View style={{width: 350, height: 400, backgroundColor: 'pink'}}>
                    <GLView style={{ width: 350, height: 400, borderWidth: 2, borderColor: 'green' }} onContextCreate={this.onContextCreate} />
                </View>
                <SegmentSlider
                  val={this.state.sliderValue}
                  max={maxVal}
                  label='Z Segment:'
                  onSliderChange={this.handleSliderChange}
                />
                <Text>Foo</Text>
                </View>
               );
    }

    arrayIndex = (x, y, z) => {
        if (!this.props.headers.xspace) {
            return;
        }
        const ySize = this.props.headers.yspace.space_length;
        const xSize = this.props.headers.xspace.space_length;
        return z + ySize * (y + x * xSize);
    }

    arrayValue = (x, y, z) => {
        // console.log('this',this);
        if (!this.state.dataview) {
            console.warn('No dataview', this.state);
            return;
        }
        if (!this.props.headers.xspace) {
            console.warn('No xspace');
            return;
        }
        const idx = this.arrayIndex(x, y, z);
        return this.state.dataview[idx];
    }

    drawFrame = () => {
        if (!this.state.dataview) {
            console.log('No dataview');
            return;
        }
        if (!this.props.headers.xspace) {
            console.log('no xspace', typeof(this.props.headers), this.props.headers);
            return;
        }
        const ySize = this.props.headers.yspace.space_length;
        const xSize = this.props.headers.xspace.space_length;
        console.log('size', xSize, ySize);
        for(let x = 0; x < xSize; x++) {
            for(let y = 0; y < ySize; y++) {
                this.drawPixel(x, y);
            }
        }
    }

    drawPixel = (x, y) => {
        console.log('x, y = ?', x, y, this.arrayValue(x, y, this.state.sliderValue));
    }
    onContextCreate = (gl) => {
      console.log('on context create');
      const ctx = new Expo2DContext(gl);
      this.setState({'ctx': ctx});
      console.log('draw frame');
      this.drawFrame();
      ctx.fillStyle = "rgba(255, 255, 0, 1)";
      ctx.fillRect(0, 0, 10, 10);
      ctx.fillRect(30, 30, 10, 10);
      ctx.fillRect(767, 767, 10, 10);
      ctx.flush();
      gl.endFrameEXP();
      return;
    }
}
