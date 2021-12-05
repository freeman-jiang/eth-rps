import React, { useContext } from "react";
import AppContext from "../utils/AppContext";
import { Flex } from "@chakra-ui/layout";
import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/number-input";
import {
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from "@chakra-ui/slider";
import { Icon } from "@iconify/react";

export const Bet = () => {
  const value = useContext(AppContext);
  const handleChange = (bet) => value.setBet(bet);
  // const format = (bet) => `${bet} ETH`;
  // const parse = (bet) => bet.replace(/^\ETH/, "");
  const format = (val) => `Ξ ` + val;
  const parse = (val) => val.replace(/^\$/, "");

  return (
    <Flex>
      <NumberInput
        disabled={value.state.status !== 0}
        min={0}
        maxW="8rem"
        mr="2rem"
        precision={3}
        step={0.001}
        value={format(value.state.bet)}
        onChange={(valueString) => value.setBet(parse(valueString))}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      <Slider
        disabled={value.state.status !== 0}
        min={0}
        max={10}
        step={0.001}
        flex="1"
        focusThumbOnChange={false}
        value={value.state.bet}
        onChange={handleChange}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb fontSize="xs" boxSize={6}>
          <Icon color="black" icon="mdi:ethereum" fontSize={18} />
        </SliderThumb>
      </Slider>
    </Flex>
  );
};
