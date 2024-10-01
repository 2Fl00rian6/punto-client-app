import React, { useState } from "react";
import { Button, Box, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2';
import Card from "./Card";

const initialBoard = Array.from({ length: 6 }, () => Array(6).fill(null));

const generateDeck = () => {
    const deck = [];
    for (let i = 1; i <= 9; i++) {
        const count = i === 1 || i === 2 ? 2 : 3;
        for (let j = 0; j < count; j++) {
            deck.push(i);
        }
    }
    return deck.sort(() => Math.random() - 0.5);
};

const Board = () => {
    const [board, setBoard] = useState(initialBoard);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [selectedCardIndex, setSelectedCardIndex] = useState(null);
    const [winner, setWinner] = useState(null);
    const [players, setPlayers] = useState([
        { name: "Joueur 1", color: "red", deck: generateDeck(), hand: [] },
        { name: "Joueur 2", color: "blue", deck: generateDeck(), hand: [] },
        { name: "Joueur 3", color: "green", deck: generateDeck(), hand: [] },
    ]);

    players.forEach(player => {
        if (player.hand.length === 0) {
            player.hand = player.deck.splice(0, 2);
        }
    });

    const checkWinner = (newBoard) => {
        const checkLine = (cells) => {
            const colors = cells.map(cell => cell?.color);
            return colors.every(color => color && color === colors[0]);
        };

        // Vérifier chaque ligne
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 3; col++) {
                const line = newBoard[row].slice(col, col + 4);
                if (checkLine(line)) return line[0].color;
            }
        }

        // Vérifier chaque colonne
        for (let col = 0; col < 6; col++) {
            for (let row = 0; row < 3; row++) {
                const line = [newBoard[row][col], newBoard[row + 1][col], newBoard[row + 2][col], newBoard[row + 3][col]];
                if (checkLine(line)) return line[0].color;
            }
        }

        // Vérifier les diagonales (haut-gauche vers bas-droit)
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const line = [
                    newBoard[row][col],
                    newBoard[row + 1][col + 1],
                    newBoard[row + 2][col + 2],
                    newBoard[row + 3][col + 3],
                ];
                if (checkLine(line)) return line[0].color;
            }
        }

        // Vérifier les diagonales (bas-gauche vers haut-droit)
        for (let row = 3; row < 6; row++) {
            for (let col = 0; col < 3; col++) {
                const line = [
                    newBoard[row][col],
                    newBoard[row - 1][col + 1],
                    newBoard[row - 2][col + 2],
                    newBoard[row - 3][col + 3],
                ];
                if (checkLine(line)) return line[0].color;
            }
        }

        return null; // Aucun gagnant
    };

    const handleCardClick = (rowIndex, colIndex) => {
        if (selectedCardIndex !== null && !winner) {
            const player = players[currentPlayerIndex];
            const playedCard = player.hand[selectedCardIndex];

            const currentCardOnBoard = board[rowIndex][colIndex];

            if (currentCardOnBoard) {
                if (currentCardOnBoard.color === player.color) {
                    alert("Vous ne pouvez pas superposer une carte sur une de vos propres cartes !");
                    return;
                }

                if (playedCard <= currentCardOnBoard.value) {
                    alert(`Vous ne pouvez pas placer une carte de valeur ${playedCard} sur une carte de valeur ${currentCardOnBoard.value}`);
                    return;
                }
            }

            const newBoard = board.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                    if (rIdx === rowIndex && cIdx === colIndex) {
                        return { value: playedCard, color: player.color };
                    }
                    return cell;
                })
            );
            setBoard(newBoard);

            const newHand = player.hand.filter((_, idx) => idx !== selectedCardIndex);
            newHand.push(player.deck.shift());

            const updatedPlayers = players.map((p, idx) => {
                if (idx === currentPlayerIndex) {
                    return { ...p, hand: newHand };
                }
                return p;
            });

            setSelectedCardIndex(null);
            setPlayers(updatedPlayers);

            const winnerColor = checkWinner(newBoard);
            if (winnerColor) {
                setWinner(players.find(p => p.color === winnerColor).name);
            } else {
                setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
            }
        }
    };

    const handleSelectCard = (cardIndex) => {
        setSelectedCardIndex(cardIndex);
    };

    return (
        <Box>
            <Typography variant="h5">
                {winner ? `Gagnant : ${winner}` : `Au tour de ${players[currentPlayerIndex].name}`}
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center" style={{ marginTop: "20px" }}>
                {board.map((row, rowIndex) => (
                    <Grid container key={rowIndex}>
                        {row.map((cell, colIndex) => (
                            <Grid xs={2} key={colIndex} display="flex" justifyContent="center" alignItems="center">
                                <Card
                                    cardValue={cell}
                                    onClick={() => handleCardClick(rowIndex, colIndex)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                ))}
            </Grid>

            <Button
                variant="contained"
                style={{ marginTop: "20px" }}
                onClick={() => {
                    setBoard(initialBoard);
                    setWinner(null);
                    setCurrentPlayerIndex(0);
                }}
            >
                Réinitialiser le jeu
            </Button>

            <Box mt={4} sx={{ position: 'absolute', right: '150px', top: '30%' }}>
                {players.map((player, idx) => (
                    <Box key={idx} mt={2}>
                        <Typography>Cartes de {player.name}:</Typography>
                        <Grid container spacing={2} justifyContent="center">
                            {player.hand.map((card, cardIdx) => (
                                <Grid xs={3} key={cardIdx}>
                                    <Card
                                        cardValue={{ value: card, color: player.color }}
                                        onClick={() => currentPlayerIndex === idx && handleSelectCard(cardIdx)}
                                        selected={selectedCardIndex === cardIdx && currentPlayerIndex === idx}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default Board;
