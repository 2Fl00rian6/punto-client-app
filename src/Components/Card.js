import React from "react";
import { Paper } from "@mui/material";

const Card = ({ cardValue, onClick, selected }) => {
    const { value, color } = cardValue || {};

    return (
        <Paper
            elevation={3}
            onClick={onClick}
            style={{
                width: "80px",
                height: "80px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "24px",
                cursor: "pointer",
                backgroundColor: color || "white",
                color: color ? "white" : "black",
                border: selected ? "3px solid yellow" : "none", // Met en évidence la carte sélectionnée
            }}
        >
            {value ? value : ""}
        </Paper>
    );
};

export default Card;