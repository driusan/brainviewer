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
            sliderValue: 100,
            maxVal: 0,
            maxIntensity: null,
            minIntensity: null,
        };

        if (!props.headers) {
            console.log('No headers');
            return;
        }
        let dv;
        console.log('setting state');
        this.setState({dataview: new DataView(props.rawData)});

        this.onContextCreate = this.onContextCreate.bind(this); // Bind the method to the correct context
    }

    handleSliderChange = (newValue) => {
        this.setState({ sliderValue: newValue });
        this.drawFrame();
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

        console.log('rendering');///, this.state);
        //this.drawFrame();

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
        const zSize = this.props.headers.zspace.space_length;
        // slice order is x, z, y in our test file. This should
        // be based on the headers and not hardcoded.
        return y + 
            zSize * z + 
            zSize * x * ySize
        //return y + zSize * (z  + (x * (xSize)));

    }

    arrayValue = (x, y, z) => {
        if (!this.state.dataview) {
            return;
        }
        if (!this.props.headers.xspace) {
            console.warn('No xspace');
            return;
        }
        const idx = this.arrayIndex(x, y, z);
        return this.state.dataview.getFloat32(idx*4, true);
    }

    drawFrame = () => {
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
            // console.log('row', x);
        }

        console.log('flushing');
        if (!this.state.ctx) {
            console.log('no ctx');
        } else {
            this.state.ctx.flush();
            this.state.gl.endFrameEXP();
        }
        console.log('flushed');
      //gl.endFrameEXP();
    }

    scale(val) {
        if (this.state.minIntensity === null|| this.state.maxIntensity=== null) {
            return;
            throw new Error('No min or max');
        }
        const min = this.state.minIntensity;
        const max = this.state.maxIntensity;
        const range = max-min;
        return (val-min) / range;
    }

    drawPixel = (x, y) => {
        const val = this.arrayValue(x, y, this.state.sliderValue);
        if (typeof(val) == "undefined" || this.state.minIntensity === null || this.state.maxIntensity === null) {
            //console.log(val, this.state.minIntensity, this.state.maxIntensity);
            return;
        }
        if (!this.state.ctx) {
            return;
        }
        // console.log(this.state.ctx, this.state.ctx.gl.drawingBufferWidth, this.props.headers.xspace.space_length);
        const ctx = this.state.ctx;
        const pixelXSize = ctx.gl.drawingBufferWidth / this.props.headers.xspace.space_length;
        const pixelYSize = ctx.gl.drawingBufferHeight / this.props.headers.yspace.space_length;

        
         // test data goes 0-546, hack: divided by 2 to get close to
         // 0-256
        // const valRGB = val / 2; 
        const valRGB = this.scale(val)*256;
        ctx.fillStyle = "rgba(" + valRGB + ", " + valRGB + "," + valRGB + ", 1)";
        // ctx.fillStyle = "rgba(128, 128, 128, 1)";
        // console.log(ctx.fillStyle);
        // console.log(pixelXSize, pixelYSize);
        // console.log(ctx.gl.drawingBufferWidth, this.props.headers.xspace.space_length, (ctx.gl.drawingBufferWidth / this.props.headers.xspace.space_length), 'fillrect', x*pixelXSize, y*pixelYSize, pixelXSize, pixelYSize);

        // console.log('filling', x, y);
        ctx.fillRect(x*pixelXSize, y*pixelYSize, pixelXSize, pixelYSize);
        // console.log('x, y = ?', x, y, this.scale(val, this.state.minIntensity, this.state.maxIntensity));
    }
    onContextCreate = (gl) => {
      console.log('on context create');
      const ctx = new Expo2DContext(gl);
      if (this.props.headers.datatype == "float32") {
            //dv = new Float32Array(this.props.rawData);
            console.log("new dataview2");
            const dv = new DataView(this.props.rawData);
            let min = null;
            let max = null;
            for(let i = 0; i < this.props.rawData.byteLength; i += 4) {
                const val = dv.getFloat32(i, true);
                if (min == null || val < min) {
                    min = val;
                }
                if (max == null || val > max) {
                    max = val;
                }
            }
            console.log('min, max', min, max);
            this.setState({ctx: ctx, dataview: new DataView(this.props.rawData), minIntensity: min, maxIntensity: max, gl: gl});
            console.log('draw frame');
            this.drawFrame();
        } else {
            return;
            console.warn("unhandled datatype");
        }
      // this.setState({'ctx': ctx});
      /*
      console.log('draw square');
      ctx.fillStyle = "rgba(255, 255, 0, 1)";
      ctx.fillRect(0, 0, 10, 10);
      ctx.fillRect(30, 30, 10, 10);
      ctx.fillRect(767, 767, 10, 10);
      ctx.flush();
      gl.endFrameEXP();
      */
      return;
    }
}
