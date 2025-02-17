const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const { v4: uuidv4 } = require("uuid"); // Générer un identifiant unique

const app = express();
const port = 8080;

// Middleware
app.use(express.json());
app.use(cors());

// Servir les fichiers statiques (HTML, CSS, JS) depuis le dossier "public"
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Connexion à MongoDB
mongoose.connect("mongodb://localhost:27017/greatcoffee", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ Connexion MongoDB réussie"))
.catch(err => console.error("❌ Erreur de connexion MongoDB :", err));

// ✅ Définition du modèle de commande
const commandeSchema = new mongoose.Schema({
    orderId: { type: String, unique: true }, // Numéro de commande unique
    cart: Array,  
    totalPrice: String,
    name: String,
    prenom: String,
    email: String,
    adresse: String,
    paymentMethod: String,
    date: { type: Date, default: Date.now }
});

const Commande = mongoose.model("Commande", commandeSchema);

// ✅ Route pour enregistrer une commande
app.post("/api/commandes", async (req, res) => {
    const { cart, totalPrice, name, prenom, email, adresse, paymentMethod } = req.body;
    
    if (!cart || cart.length === 0) {
        return res.status(400).json({ message: "Le panier est vide" });
    }

    try {
        const newCommande = new Commande({ 
            orderId: uuidv4(),  // Génère un ID unique
            cart, totalPrice, name, prenom, email, adresse, paymentMethod 
        });
        await newCommande.save();
        
        res.status(201).json({ 
            message: "✅ Commande enregistrée avec succès !", 
            orderId: newCommande.orderId 
        });
    } catch (error) {
        res.status(500).json({ message: "❌ Erreur serveur", error });
    }
});

// ✅ Route pour récupérer **toutes** les commandes
app.get("/api/commandes", async (req, res) => {
    try {
        const commandes = await Commande.find();
        res.status(200).json(commandes);
    } catch (error) {
        res.status(500).json({ message: "❌ Erreur serveur", error });
    }
});

// ✅ Route pour récupérer une **commande spécifique** via son numéro
app.get("/api/commandes/:orderId", async (req, res) => {
    try {
        const commande = await Commande.findOne({ orderId: req.params.orderId });

        if (!commande) {
            return res.status(404).json({ message: "❌ Commande introuvable." });
        }
        res.status(200).json(commande);
    } catch (error) {
        res.status(500).json({ message: "❌ Erreur serveur", error });
    }
});

// ✅ Modèle pour les informations des clients
const clientSchema = new mongoose.Schema({
    nom: String,
    prenom: String,
    dateNaissance: String,
    sexe: String,
    email: { type: String, unique: true },
    motDePasse: String,
    adresseLivraison: String,
    methodePaiement: String
});

const Client = mongoose.model("Client", clientSchema);

// ✅ Route pour enregistrer un client
app.post("/api/clients", async (req, res) => {
    const { nom, prenom, dateNaissance, sexe, email, motDePasse, adresseLivraison, methodePaiement } = req.body;

    if (!nom || !email || !motDePasse) {
        return res.status(400).json({ message: "⚠ Les champs nom, email et mot de passe sont obligatoires." });
    }

    try {
        const newClient = new Client({ 
            nom, prenom, dateNaissance, sexe, email, motDePasse, adresseLivraison, methodePaiement 
        });
        await newClient.save();
        res.status(201).json({ message: "✅ Compte créé avec succès !", client: newClient });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création du compte", error });
    }
});

// ✅ Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
