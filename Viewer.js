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
            xVal: 100,
            yVal: 100,
            zVal: 100,
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

    handleSliderChange = (plane, newValue) => {
        this.setState({ plane: newValue });
        this.drawPanel();
    };

    drawPanel = () => {
      const xsize = this.props.headers.xspace.space_length;
      const ysize = this.props.headers.yspace.space_length;
      const intensities = [];
      for (let x = 0; x < xsize; x++) {
        for(let y = 0; y < ysize; y++) {
          intensities.push(this.arrayValue(x, y, this.state.sliderValue));
        }
      }

      var colorUniformLocation = this.state.colorUniformLocation; 
      for(let i = 0; i < xsize*ysize; i++) {
          const intensity = intensities[i]; 
          const val = (intensity-this.state.data.min) / (this.state.data.max-this.state.data.min);
          this.state.gl.uniform4f(colorUniformLocation, val, val, val, 1);

          this.state.gl.drawArrays(this.state.gl.POINTS, i, 1);
      }
      this.state.gl.flush();
      this.state.gl.endFrameEXP();
    }

    render() {
        if( !this.props.headers) {
            return <View><Text>Loading headers..</Text></View>;
        }
        if (!this.props.rawData){
            return <View><Text>Loading raw data..</Text></View>
        }

        var maxValX = 100;
        if (this.props.headers.xspace) {
            maxValX = this.props.headers.xspace.space_length;
        }

        var maxValY = 100;
        if (this.props.headers.yspace) {
            maxValY = this.props.headers.yspace.space_length;
        }

        var maxValZ = 100;
        if (this.props.headers.zspace) {
            maxValZ = this.props.headers.zspace.space_length;
        }

        console.log('rendering');///, this.state);

        return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <View style={{width: 350, height: 400, backgroundColor: 'pink'}}>
                    <GLView style={{ width: 350, height: 400, borderWidth: 2, borderColor: 'green' }} onContextCreate={this.onContextCreateX} />
                </View>
                <SegmentSlider
                  val={this.state.xVal}
                  valName={'xVal'}
                  max={maxValX}
                  label='X Segment:'
                  onSliderChange={this.handleSliderChange}
                />
                <View style={{width: 350, height: 400, backgroundColor: 'pink'}}>
                    <GLView style={{ width: 350, height: 400, borderWidth: 2, borderColor: 'green' }} onContextCreate={this.onContextCreateY} />
                </View>
                <SegmentSlider
                  val={this.state.yVal}
                  valName={'yVal'}
                  max={maxValY}
                  label='Y Segment:'
                  onSliderChange={this.handleSliderChange}
                />
                <View style={{width: 350, height: 400, backgroundColor: 'pink'}}>
                    <GLView style={{ width: 350, height: 400, borderWidth: 2, borderColor: 'green' }} onContextCreate={this.onContextCreateZ} />
                </View>
                <SegmentSlider
                  val={this.state.zVal}
                  valName={'zVal'}
                  max={maxValZ}
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
    }

    arrayValue = (x, y, z) => {
        if (!this.state.dataview) {
            // console.log('No dataview');
            return;
        }
        if (!this.props.headers.xspace) {
            console.warn('No xspace');
            return;
        }
        const idx = this.arrayIndex(x, y, z);
        return this.state.dataview.getFloat32(idx*4, true);
    }

    preprocess = (rawdata) => {
        const dv = new DataView(rawdata);
        const floatArray = new Float32Array(this.props.rawData.byteLength / 4);
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
          floatArray[i / 4] = val;
        }
        console.log('min, max', min, max, floatArray.byteLength);
        return {
            min: min,
            max: max,
            floats: floatArray,
        }
    }

    onContextCreateX = (gl) => {
        this.onContextCreate(gl, 'x');
    }

    onContextCreateY = (gl) => {
        this.onContextCreate(gl, 'y');
    }

    onContextCreateZ = (gl) => {
        this.onContextCreate(gl, 'z');
    }

    onContextCreate = (gl, plane) => {
        const data = this.preprocess(this.props.rawData);
        this.setState({data: data, gl: gl, dataview: new DataView(this.props.rawData)});

        // this.setState({ctx: ctx, dataview: new DataView(this.props.rawData), minIntensity: min, maxIntensity: max, gl: gl});
        console.log('draw frame');
        console.log('on context create');
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clearColor(0, 1, 1, 1);

        // Create vertex shader (shape & position)
        const vert = gl.createShader(gl.VERTEX_SHADER);
        // FIXME: Fix gl_PointSize, should be calculated based on drawingBuferWidth/Height and xspace/yspace length
        gl.shaderSource(
          vert,
          `
          attribute vec2 a_pos;
          uniform vec2 u_resolution;
          uniform float u_pixelsize;
          void main(void) {
            vec2 normalize_to_one = a_pos / u_resolution;
            vec2 normalize_to_two = normalize_to_one * 2.0;
            vec2 normalize_to_clipspace = normalize_to_two - 1.0;

            gl_Position = vec4(normalize_to_clipspace, 0, 1);
            gl_PointSize = u_pixelsize; 
          }
        `
        );
            // gl_Position = vec4(normalize_to_clipspace, 0, 1);
        gl.compileShader(vert);

        // Create fragment shader (color)
        const frag = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(
          frag,
          `
          precision mediump float;

          uniform vec4 u_color;
          void main(void) {
            gl_FragColor = u_color;
          }
        `
        );
        gl.compileShader(frag);

        // Link together into a program
        const program = gl.createProgram();

        let positionAttributeLocation = gl.getAttribLocation(program, "a_pos");

        
        let positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        let zsize;
        let ysize;
        let xsize;
        let positions = [];
        let intensities = [];
        switch (plane) {
          case 'x':
            ysize = this.props.headers.yspace.space_length;
            zsize = this.props.headers.zspace.space_length;
            for (let y = 0; y < ysize; y++) {
                for(let z = 0; z < ysize; z++) {
                    positions.push(y);
                    positions.push(z);
                }
            }
          case 'y':
            xsize = this.props.headers.xspace.space_length;
            zsize = this.props.headers.zspace.space_length;
            for (let x = 0; x < xsize; x++) {
                for(let z = 0; z < zsize; z++) {
                    positions.push(x);
                    positions.push(z);
                }
            }
          case 'z':
            xsize = this.props.headers.xspace.space_length;
            ysize = this.props.headers.yspace.space_length;
            for (let x = 0; x < xsize; x++) {
                for(let y = 0; y < ysize; y++) {
                    positions.push(x);
                    positions.push(y);
                }
            }
        }
        //gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
        //console.log('u_resolition', xsize, ysize);
        
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, data.floats);
        gl.bufferData(gl.ARRAY_BUFFER, data.floats, gl.STATIC_DRAW);


        gl.attachShader(program, vert);
        gl.attachShader(program, frag);
        gl.linkProgram(program);
        gl.useProgram(program);
        let resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
        let pixelSizeUniformLocation = gl.getUniformLocation(program, "u_pixelsize");

        gl.uniform2f(resolutionUniformLocation, xsize, ysize);
        console.log('pointuniform', pixelSizeUniformLocation, resolutionUniformLocation);
        gl.uniform1f(pixelSizeUniformLocation, gl.drawingBufferWidth / xsize );
        gl.enableVertexAttribArray(positionAttributeLocation);

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
       
        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset)

        gl.clear(gl.COLOR_BUFFER_BIT);
        var colorUniformLocation = gl.getUniformLocation(program, "u_color");
        this.setState({colorUniformLocation: colorUniformLocation});
        return;
    }
}
