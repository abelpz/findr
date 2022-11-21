import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Typography,
} from "@mui/material";
import dummyText from "../data/dummy.txt";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState } from "react";

const Post = () => {
  const [text, setText] = useState("");

  useEffect(() => {
    fetch("public/dummy.txt").then(async (data) => {
      setText(await data.text());
    });
  });

  return (
    <Card sx={{ margin: 5 }}>
      <CardHeader
        action={
          <IconButton aria-label="settings">
            <SearchIcon />
          </IconButton>
        }
        title="John Doe"
        subheader="September 14, 2022"
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {text}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Post;
