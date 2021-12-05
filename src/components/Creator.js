import {
  Box,
  Center,
  useColorModeValue,
  Heading,
  Text,
  Stack,
  Image,
  Link,
} from "@chakra-ui/react";

export const Creator = ({ name, subtitle, description, img }) => {
  const IMAGE = img;
  return (
    <Center>
      <Box
        role={"group"}
        p={6}
        maxW={"lg"}
        w={"full"}
        bg={useColorModeValue("white", "gray.900")}
        boxShadow={"2xl"}
        rounded={"lg"}
        pos={"relative"}
        zIndex={1}
      >
        <Center>
          <Box rounded={"lg"} mt={-12} pos={"relative"} height={"230px"}>
            <Image
              rounded={"lg"}
              height={230}
              width={282}
              objectFit={"cover"}
              src={IMAGE}
              alt={name}
            />
          </Box>
        </Center>
        <Stack pt={10} align={"center"}>
          <Heading fontSize={"2xl"} fontFamily={"body"} fontWeight={500}>
            {name}
          </Heading>
          <Text color={"gray.500"} fontSize={"sm"}>
            {subtitle}
          </Text>

          <Stack direction={"row"} align={"center"}>
            <Text
              textAlign={"center"}
              color={useColorModeValue("gray.700", "gray.400")}
              px={3}
            >
              {description}
            </Text>
          </Stack>
        </Stack>
      </Box>
    </Center>
  );
};
