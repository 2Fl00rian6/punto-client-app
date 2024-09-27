import React from "react";
import Board from "./Components/Board";
import { Container, Typography } from "@mui/material";

function App() {
    return (
        <Container style={{ textAlign: "center", marginTop: "20px" }}>
            <Typography variant="h3" gutterBottom>
                Punto Game
            </Typography>
            <Board />
        </Container>
    );
}

export default App;