/*eslint-disable*/
import React from "react";
import { Flex, Link, List, ListItem, Text } from "@chakra-ui/react";
import PropTypes from "prop-types";

export default function AppFooter(props) {
  // const linkTeal = useColorModeValue("red.400", "red.200");=
  return (
    <Flex
      flexDirection={{
        base: "column",
        xl: "row",
      }}
      alignItems={{
        base: "center",
        xl: "start",
      }}
      justifyContent="space-between"
      px="30px"
      pb="20px"
    >
      <Text
        color="gray.400"
        textAlign={{
          base: "center",
          xl: "start",
        }}
        mb={{ base: "20px", xl: "0px" }}
      >
        &copy; {1900 + new Date().getYear()}{" "}
        <a href="/" target="_blank" rel="noopener noreferrer">
          Africartz
        </a>
      </Text>
      <List display="flex">
        <ListItem
          me={{
            base: "20px",
            md: "44px",
          }}
        >
          <Link color="gray.400" href="">
            {document.documentElement.dir === "rtl"
              ? "توقيت الإبداعية"
              : ""}
          </Link>
        </ListItem>
      </List>
    </Flex>
  );
}
