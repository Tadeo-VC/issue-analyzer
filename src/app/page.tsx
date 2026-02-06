import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import GitHubLoginButton from "../components/gitHubLoginButton";

export default function HomePage() {
  
  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-r, teal.400, blue.500)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <VStack
        gap={6}
        bg="whiteAlpha.800"
        p={12}
        rounded="2xl"
        shadow="xl"
        textAlign="center"
      >
        <Heading as="h1" size="2xl" color="gray.800">
          Issue Analyzer
        </Heading>
        <Text fontSize="lg" color="gray.700" maxW="md">
          Analiza tus issues de GitHub usando IA y obtén insights al instante.
        </Text>
        <GitHubLoginButton/>
      </VStack>
    </Box>
  );
}
