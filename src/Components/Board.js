import React, { useState, useEffect } from "react";
import { Button, Box, Typography, Modal, TextField } from "@mui/material";
import { HubConnectionBuilder, HttpTransportType, LogLevel } from '@microsoft/signalr';
import Grid from "@mui/material/Grid2";
import Card from "./Card";

const initialBoard = Array.from({ length: 6 }, () => Array(6).fill(null));

const Board = () => {
    const [board, setBoard] = useState(initialBoard);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [selectedCardIndex, setSelectedCardIndex] = useState(null);
    const [winner, setWinner] = useState(null);
    const [players, setPlayers] = useState([]);  // Liste des joueurs
    const [modalOpen, setModalOpen] = useState(true);
    const [playerName, setPlayerName] = useState("");
    const [connection, setConnection] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl('http://localhost:5000/punto', {
                skipNegotiation: true,
                transport: HttpTransportType.WebSockets
            })
            .configureLogging(LogLevel.Information)
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log("Connecté au SignalR");
    
                    connection.on('MiseAJourJoueurs', (joueurs) => {
                        console.log("Liste des joueurs mise à jour :", joueurs);
    
                        // Remplacer complètement la liste des joueurs, car c'est probablement ce que le serveur attend
                        setPlayers(joueurs || []); 
                    });
    
                    connection.on('MettreAJourTuilesEnMain', (joueur, tuiles) => {
                        setPlayers((prevPlayers) => {
                            const updatedPlayers = [...prevPlayers];
                            const joueurTrouve = updatedPlayers.find(p => p.name === joueur);
                            if (joueurTrouve) {
                                joueurTrouve.hand = tuiles;
                            }
                            return updatedPlayers;
                        });
                    });
    
                    connection.on('MettreAJourPlateau', (nouveauPlateau) => {
                        setBoard(nouveauPlateau);
                    });
    
                    connection.on('CommencerTour', (joueur) => {
                        const index = players.findIndex(p => p.name === joueur);
                        setCurrentPlayerIndex(index);
                    });
    
                    connection.on('TerminerJeu', (vainqueur) => {
                        setWinner(vainqueur);
                    });
    
                    connection.on('ErreurCoupNonAutorise', (message) => {
                        alert("Coup non autorisé: " + message);
                    });
    
                })
                .catch((error) => console.error("Erreur de connexion SignalR:", error));
    
            return () => {
                connection.stop()
                    .then(() => console.log("Déconnecté du SignalR"))
                    .catch(err => console.error("Erreur lors de la déconnexion:", err));
            };
        }
    }, [connection]);
    
    const handlePlayerNameSubmit = () => {
        if (playerName.trim() === "") return;

        connection.send("RejoindrePartie", playerName)
            .then(() => {
                setModalOpen(false);
            })
            .catch((error) => console.error("Erreur lors de l'envoi du nom du joueur:", error));
    };

    const handleStartGame = () => {
        if (players.length < 2) {
            alert("Il faut au moins 2 joueurs pour commencer la partie.");
            return;
        }

        connection.send("DemarrerPartie")
            .then(() => {
                setGameStarted(true);
            })
            .catch((error) => console.error("Erreur lors du démarrage de la partie:", error));
    };

    return (
        <Box>
            {/* Modal pour entrer le nom du joueur */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={{ width: 300, padding: 4, backgroundColor: "white", margin: "auto", marginTop: "20%", borderRadius: 2 }}>
                    <Typography id="modal-title" variant="h6" component="h2">
                        Entrez votre nom
                    </Typography>
                    <TextField
                        label="Nom du joueur"
                        variant="outlined"
                        fullWidth
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                    <Button
                        variant="contained"
                        onClick={handlePlayerNameSubmit}
                        sx={{ mt: 2 }}
                    >
                        Rejoindre
                    </Button>
                </Box>
            </Modal>

            {/* Si la partie n'a pas encore commencé, afficher l'écran d'attente */}
            {!gameStarted && (
                <Box>
                    <Typography variant="h5">
                        En attente des joueurs...
                    </Typography>

                    {/* Afficher la liste des joueurs qui ont rejoint */}
                    {players.length > 0 && players.map((player, idx) => (
                        <Typography key={idx}>
                            {player.name} a rejoint la partie.
                        </Typography>
                    ))}

                    {/* Le bouton pour démarrer la partie apparaît seulement si 2 joueurs ou plus ont rejoint */}
                    {players.length >= 2 && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleStartGame}
                            sx={{ mt: 2 }}
                        >
                            Démarrer la partie
                        </Button>
                    )}
                </Box>
            )}

            {/* Si la partie a commencé, afficher le plateau et les cartes */}
            {gameStarted && (
                <Box>
                    <Typography variant="h5">
                        {winner ? `Gagnant: ${winner}` : `Au tour de ${players[currentPlayerIndex]?.name}`}
                    </Typography>

                    {/* Afficher le plateau et les cartes comme avant... */}
                </Box>
            )}
        </Box>
    );
};

export default Board;