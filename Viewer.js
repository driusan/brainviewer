import React from 'react';
import { View, Text } from 'react-native';
import { GLView } from 'expo-gl';
import Expo2DContext from "expo-2d-context";
import { SegmentSlider } from './SegmentSlider';


export class Viewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sliderValue: 0,  
        };
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

        return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <View style={{width: 350, height: 400, backgroundColor: 'pink'}}>
                <GLView style={{ width: 350, height: 400, borderWidth: 2, borderColor: 'green' }} onContextCreate={this.onContextCreate} />
                </View>
                <SegmentSlider
                  val={this.state.sliderValue}
                  max={this.props.headers.zspace.space_length}
                  label='X Segment:'
                  onSliderChange={this.handleSliderChange}
                />
                <Text>Foo</Text>
                </View>
               );
    }

    onContextCreate(gl) {
      const ctx = new Expo2DContext(gl);
      this.setState({'ctx': ctx});
      ctx.fillStyle = "rgba(255, 255, 0, 1)";
      ctx.fillRect(0, 0, 10, 10);
      ctx.fillRect(30, 30, 10, 10);
      ctx.fillRect(767, 767, 10, 10);
      ctx.flush();
      gl.endFrameEXP();
      return;
    }
}
