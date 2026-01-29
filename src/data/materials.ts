
export interface MaterialSpecification {
    caracteristique: string;
    unite: string;
    valeur_specifiee: string;
    valeur_garantie: string;
}

export interface MaterialItem {
    name: string;
    type: string;
    specifications: MaterialSpecification[];
}

export interface MaterialsData {
    [category: string]: MaterialItem[];
}

export const materialsData: MaterialsData = {
    "Câbles": [
        {
            "name": "Cable préas 2x16mm²",
            "type": "CABLE BT TORSADE DE BRANCHEMENT 2X16 mm²",
            "specifications": [
                { "caracteristique": "Fabricant", "unite": "_", "valeur_specifiee": "à indiquer", "valeur_garantie": "" },
                { "caracteristique": "Type", "unite": "_", "valeur_specifiee": "Conducteurs isolés en faisceau torsadé", "valeur_garantie": "" },
                { "caracteristique": "Installation", "unite": "_", "valeur_specifiee": "Réseau aérien", "valeur_garantie": "" },
                { "caracteristique": "Montage", "unite": "_", "valeur_specifiee": "Suspendu sur support", "valeur_garantie": "" },
                { "caracteristique": "Fréquence", "unite": "Hz", "valeur_specifiee": "50", "valeur_garantie": "" },
                { "caracteristique": "Section", "unite": "mm²", "valeur_specifiee": "2 X 16", "valeur_garantie": "" },
                { "caracteristique": "Nombre de conducteurs", "unite": "_", "valeur_specifiee": "2", "valeur_garantie": "" },
                { "caracteristique": "Diamètre extérieur approximatif du câble 2x16mm²", "unite": "mm", "valeur_specifiee": "15", "valeur_garantie": "" },
                { "caracteristique": "Masse approximative du câble", "unite": "kg/km", "valeur_specifiee": "140", "valeur_garantie": "" },
                { "caracteristique": "Résistance linéique à 20 ° C", "unite": "Ω / km", "valeur_specifiee": "1.91", "valeur_garantie": "" },
                { "caracteristique": "Intensité en régime permanent", "unite": "A", "valeur_specifiee": "93", "valeur_garantie": "" },
                { "caracteristique": "Nature de l'âme", "unite": "_", "valeur_specifiee": "Aluminium, âme rigide circulaire câblée, classe 2", "valeur_garantie": "" },
                { "caracteristique": "Diamètre minimal de l'âme", "unite": "mm", "valeur_specifiee": "4.6", "valeur_garantie": "" },
                { "caracteristique": "Diamètre maximal de l'âme", "unite": "mm", "valeur_specifiee": "5.1", "valeur_garantie": "" },
                { "caracteristique": "épaisseur moyenne de la gaine isolante", "unite": "mm", "valeur_specifiee": "1.2", "valeur_garantie": "" },
                { "caracteristique": "diamètre extérieur minimal d'un conducteur", "unite": "mm", "valeur_specifiee": "7", "valeur_garantie": "" },
                { "caracteristique": "diamètre extérieur maximal d'un conducteur", "unite": "mm", "valeur_specifiee": "7.8", "valeur_garantie": "" },
                { "caracteristique": "Isolation", "unite": "_", "valeur_specifiee": "Polyéthylène réticulé (PR/XLPE) noir", "valeur_garantie": "" },
                { "caracteristique": "Identification des conducteurs", "unite": "_", "valeur_specifiee": "Par numérotation 1 – 2 sur phases", "valeur_garantie": "" },
                { "caracteristique": "Marquage", "unite": "_", "valeur_specifiee": "Norme - Fabricant- année fabrication", "valeur_garantie": "" },
                { "caracteristique": "Tension de service nominale Uo/ U (KV)", "unite": "kV", "valeur_specifiee": "0,6/ 1 KV", "valeur_garantie": "" },
                { "caracteristique": "Température maximale de l'âme", "unite": "°C", "valeur_specifiee": "90", "valeur_garantie": "" },
                { "caracteristique": "Température maximale en court-circuit (°C)", "unite": "°C", "valeur_specifiee": "250", "valeur_garantie": "" },
                { "caracteristique": "Norme de référence", "unite": "-", "valeur_specifiee": "NF C33-209", "valeur_garantie": "" }
            ]
        },
        {
            "name": "Cable préas 4x16mm²",
            "type": "CABLE BT TORSADE DE BRANCHEMENT 4X16 mm²",
            "specifications": [
                { "caracteristique": "Fabricant", "unite": "_", "valeur_specifiee": "à indiquer", "valeur_garantie": "" },
                { "caracteristique": "Type", "unite": "_", "valeur_specifiee": "Conducteurs isolés en faisceau torsadé", "valeur_garantie": "" },
                { "caracteristique": "Installation", "unite": "_", "valeur_specifiee": "Réseau aérien", "valeur_garantie": "" },
                { "caracteristique": "Montage", "unite": "_", "valeur_specifiee": "Suspendu sur support", "valeur_garantie": "" },
                { "caracteristique": "Fréquence", "unite": "Hz", "valeur_specifiee": "50", "valeur_garantie": "" },
                { "caracteristique": "Section", "unite": "mm²", "valeur_specifiee": "4 X 16", "valeur_garantie": "" },
                { "caracteristique": "Nombre de conducteurs", "unite": "_", "valeur_specifiee": "4", "valeur_garantie": "" },
                { "caracteristique": "Diamètre extérieur approximatif du câble 4x16mm²", "unite": "mm", "valeur_specifiee": "18", "valeur_garantie": "" },
                { "caracteristique": "Masse approximative du câble", "unite": "kg/km", "valeur_specifiee": "280", "valeur_garantie": "" },
                { "caracteristique": "Résistance linéique à 20 ° C", "unite": "Ω / km", "valeur_specifiee": "1.91", "valeur_garantie": "" },
                { "caracteristique": "Intensité en régime permanent", "unite": "A", "valeur_specifiee": "83", "valeur_garantie": "" },
                { "caracteristique": "Nature de l'âme", "unite": "_", "valeur_specifiee": "Aluminium, âme rigide circulaire câblée, classe 2", "valeur_garantie": "" },
                { "caracteristique": "Diamètre minimal de l'âme", "unite": "mm", "valeur_specifiee": "4.6", "valeur_garantie": "" },
                { "caracteristique": "Diamètre maximal de l'âme", "unite": "mm", "valeur_specifiee": "5.1", "valeur_garantie": "" },
                { "caracteristique": "épaisseur moyenne de la gaine isolante", "unite": "mm", "valeur_specifiee": "1.2", "valeur_garantie": "" },
                { "caracteristique": "diamètre extérieur minimal d'un conducteur", "unite": "mm", "valeur_specifiee": "7", "valeur_garantie": "" },
                { "caracteristique": "diamètre extérieur maximal d'un conducteur", "unite": "mm", "valeur_specifiee": "7.8", "valeur_garantie": "" },
                { "caracteristique": "Isolation", "unite": "_", "valeur_specifiee": "Polyéthylène réticulé (PR/XLPE) noir", "valeur_garantie": "" },
                { "caracteristique": "Identification des conducteurs", "unite": "_", "valeur_specifiee": "Par numérotation 1 – 2 – 3 sur phases", "valeur_garantie": "" },
                { "caracteristique": "Marquage", "unite": "_", "valeur_specifiee": "Norme - Fabricant- année fabrication", "valeur_garantie": "" },
                { "caracteristique": "Tension de service nominale Uo/ U (KV)", "unite": "kV", "valeur_specifiee": "0,6/ 1 KV", "valeur_garantie": "" },
                { "caracteristique": "Température maximale de l'âme", "unite": "°C", "valeur_specifiee": "90", "valeur_garantie": "" },
                { "caracteristique": "Température maximale en court-circuit (°C)", "unite": "°C", "valeur_specifiee": "250", "valeur_garantie": "" },
                { "caracteristique": "Norme de référence", "unite": "-", "valeur_specifiee": "NF C33-209", "valeur_garantie": "" }
            ]
        },
        {
            "name": "Cable préas 3x35+54,6+16mm²",
            "type": "CABLE BT TORSADE DE RESEAU 3X35+54,6+1X16 mm² A NEUTRE PORTEUR",
            "specifications": [
                { "caracteristique": "Fabricant", "unite": "_", "valeur_specifiee": "à indiquer", "valeur_garantie": "" },
                { "caracteristique": "Type", "unite": "_", "valeur_specifiee": "Conducteurs isolés en faisceau torsadé", "valeur_garantie": "" },
                { "caracteristique": "Installation", "unite": "_", "valeur_specifiee": "Réseau aérien", "valeur_garantie": "" },
                { "caracteristique": "Montage", "unite": "_", "valeur_specifiee": "Suspendu sur support", "valeur_garantie": "" },
                { "caracteristique": "Fréquence", "unite": "Hz", "valeur_specifiee": "50", "valeur_garantie": "" },
                { "caracteristique": "Section", "unite": "mm²", "valeur_specifiee": "3 X 35 + 54,6 +16", "valeur_garantie": "" },
                { "caracteristique": "Nombre de conducteurs", "unite": "_", "valeur_specifiee": "5", "valeur_garantie": "" },
                { "caracteristique": "Diamètre extérieur approximatif du câble 3 X 35 + 54,6 +16mm²", "unite": "mm", "valeur_specifiee": "33", "valeur_garantie": "" },
                { "caracteristique": "Masse approximative du câble", "unite": "kg/km", "valeur_specifiee": "780", "valeur_garantie": "" },
                { "caracteristique": "Résistance linéique à 20 ° C", "unite": "Ω / km", "valeur_specifiee": "Ph = 0,868 neutre = 0,63 EP=1,91", "valeur_garantie": "" },
                { "caracteristique": "Intensité admissible en régime permanent", "unite": "A", "valeur_specifiee": "138", "valeur_garantie": "" },
                { "caracteristique": "Intensité admissible en régime permanent du conducteur l'Eclairage public", "unite": "A", "valeur_specifiee": "83", "valeur_garantie": "" },
                { "caracteristique": "Nature de l'âme", "unite": "_", "valeur_specifiee": "Aluminium, âme rigide circulaire câblée, classe 2", "valeur_garantie": "" },
                { "caracteristique": "Nature de l'âme neutre porteur", "unite": "_", "valeur_specifiee": "Alliage d'aluminium, âme rigide circulaire câblée, section 54,6 mm2", "valeur_garantie": "" },
                { "caracteristique": "Nature de l'âme éclairage public", "unite": "_", "valeur_specifiee": "Aluminium, âme rigide circulaire câblée, section 16 mm²", "valeur_garantie": "" },
                { "caracteristique": "Diamètre minimal de l'âme", "unite": "mm", "valeur_specifiee": "Ph = 6,8 neutre = 9,2 EP=4,6", "valeur_garantie": "" },
                { "caracteristique": "Diamètre maximal de l'âme", "unite": "mm", "valeur_specifiee": "Ph = 7,3 neutre = 9,6 EP=5,1", "valeur_garantie": "" },
                { "caracteristique": "épaisseur moyenne de la gaine isolante", "unite": "mm", "valeur_specifiee": "Ph = 1,6 neutre = 1,6 EP=1,2", "valeur_garantie": "" },
                { "caracteristique": "diamètre extérieur minimal d'un conducteur", "unite": "mm", "valeur_specifiee": "Ph = 10 neutre = 12,3 EP=7", "valeur_garantie": "" },
                { "caracteristique": "diamètre extérieur maximal d'un conducteur", "unite": "mm", "valeur_specifiee": "Ph = 10,9 neutre = 13 EP=7,8", "valeur_garantie": "" },
                { "caracteristique": "Isolation", "unite": "_", "valeur_specifiee": "Polyéthylène réticulé (PR/XLPE) noir", "valeur_garantie": "" },
                { "caracteristique": "Identification des conducteurs", "unite": "_", "valeur_specifiee": "Par numérotation 1 – 2 – 3 sur phases EP1 sur conducteurs d'éclairage", "valeur_garantie": "" },
                { "caracteristique": "Marquage", "unite": "_", "valeur_specifiee": "Norme - Fabricant- année fabrication", "valeur_garantie": "" },
                { "caracteristique": "Tension de service nominale Uo/ U (KV)", "unite": "kV", "valeur_specifiee": "0,6/ 1 KV", "valeur_garantie": "" },
                { "caracteristique": "Température maximale de l'âme", "unite": "°C", "valeur_specifiee": "90", "valeur_garantie": "" },
                { "caracteristique": "Température maximale en court-circuit (°C)", "unite": "°C", "valeur_specifiee": "250", "valeur_garantie": "" },
                { "caracteristique": "Norme de référence", "unite": "-", "valeur_specifiee": "NF C33-209", "valeur_garantie": "" }
            ]
        }
    ],
    "Accessoires": [
        {
            "name": "Tuyau isolant noir de brancheme",
            "type": "Tuyau isolant",
            "specifications": [
                { "caracteristique": "Fabricant", "unite": "_", "valeur_specifiee": "A indiquer", "valeur_garantie": "" },
                { "caracteristique": "Fournisseur", "unite": "_", "valeur_specifiee": "A indiquer", "valeur_garantie": "" },
                { "caracteristique": "Norme", "unite": "_", "valeur_specifiee": "NF EN 61386-22", "valeur_garantie": "" },
                { "caracteristique": "Tenue mécanique", "unite": "_", "valeur_specifiee": "IK8", "valeur_garantie": "" },
                { "caracteristique": "Protection anti-UV", "unite": "_", "valeur_specifiee": "Oui", "valeur_garantie": "" },
                { "caracteristique": "Classement au feu", "unite": "_", "valeur_specifiee": "C2", "valeur_garantie": "" },
                { "caracteristique": "Ø Extérieur", "unite": "mm", "valeur_specifiee": "16", "valeur_garantie": "" },
                { "caracteristique": "Ø Intérieur mini", "unite": "mm", "valeur_specifiee": "10.7", "valeur_garantie": "" },
                { "caracteristique": "Tire-fils", "unite": "_", "valeur_specifiee": "Non", "valeur_garantie": "" },
                { "caracteristique": "Indice de protection conduit seul", "unite": "_", "valeur_specifiee": "IP68", "valeur_garantie": "" },
                { "caracteristique": "Résistance à écrasement à +23°C", "unite": "N", "valeur_specifiee": "750", "valeur_garantie": "" },
                { "caracteristique": "Tenue aux chocs à -5°C", "unite": "Joules", "valeur_specifiee": "6", "valeur_garantie": "" },
                { "caracteristique": "Rigidité diélectrique", "unite": "V", "valeur_specifiee": "2000", "valeur_garantie": "" },
                { "caracteristique": "Température de fonctionnement plage", "unite": "°C", "valeur_specifiee": "10 à +55", "valeur_garantie": "" },
                { "caracteristique": "Tenue à la flamme", "unite": "_", "valeur_specifiee": "Non propagateur selon NF EN 61386", "valeur_garantie": "" },
                { "caracteristique": "Rayon de courbure mini", "unite": "mm", "valeur_specifiee": "96", "valeur_garantie": "" },
                { "caracteristique": "Matériau", "unite": "_", "valeur_specifiee": "Polyoléfines additivés", "valeur_garantie": "" },
                { "caracteristique": "Sans halogène", "unite": "_", "valeur_specifiee": "Oui", "valeur_garantie": "" },
                { "caracteristique": "Couleur", "unite": "_", "valeur_specifiee": "Noir", "valeur_garantie": "" }
            ]
        },
        {
            "name": "TUBE IRO 25 NON TULIPE",
            "type": "TUBE IRO 25 NON TULIPE",
            "specifications": [
                { "caracteristique": "Type de Tube", "unite": "_", "valeur_specifiee": "TUBE IRO 25 NON TULIPE", "valeur_garantie": "" },
                { "caracteristique": "Longueur", "unite": "m", "valeur_specifiee": "3", "valeur_garantie": "" },
                { "caracteristique": "Diamètre extérieur", "unite": "mm", "valeur_specifiee": "25", "valeur_garantie": "" },
                { "caracteristique": "Diamètre intérieur mini", "unite": "mm", "valeur_specifiee": "21,4", "valeur_garantie": "" },
                { "caracteristique": "Mode de pose", "unite": "_", "valeur_specifiee": "Intérieur en apparent", "valeur_garantie": "" },
                { "caracteristique": "Couleur", "unite": "_", "valeur_specifiee": "Blanc RAL 9010", "valeur_garantie": "" },
                { "caracteristique": "Tenue aux chocs", "unite": "_", "valeur_specifiee": "2 J à -5 °C", "valeur_garantie": "" },
                { "caracteristique": "Tenue à l'écrasement", "unite": "_", "valeur_specifiee": "750 N à 23 °C", "valeur_garantie": "" },
                { "caracteristique": "Fixation", "unite": "_", "valeur_specifiee": "Par Lyre par simple clipsage", "valeur_garantie": "" },
                { "caracteristique": "Protection Minimun", "unite": "_", "valeur_specifiee": "IP 42", "valeur_garantie": "" },
                { "caracteristique": "IK", "unite": "_", "valeur_specifiee": "IK 07", "valeur_garantie": "" },
                { "caracteristique": "matières", "unite": "_", "valeur_specifiee": "PVC non propagateur de flamme", "valeur_garantie": "" },
                { "caracteristique": "Tenue au fil à incandescence", "unite": "°C", "valeur_specifiee": "960", "valeur_garantie": "" },
                { "caracteristique": "Température régime permanent", "unite": "°C", "valeur_specifiee": "10 °C à +55 °C", "valeur_garantie": "" }
            ]
        },
        {
            "name": "Grillage avertisseur",
            "type": "Grillage avertisseur",
            "specifications": [
                { "caracteristique": "Fabricant", "unite": "_", "valeur_specifiee": "A indiquer", "valeur_garantie": "" },
                { "caracteristique": "Fournisseur", "unite": "_", "valeur_specifiee": "A indiquer", "valeur_garantie": "" },
                { "caracteristique": "Norme", "unite": "_", "valeur_specifiee": "NF EN 12613, EN ISO 846", "valeur_garantie": "" },
                { "caracteristique": "Résistance à la traction mécanique", "unite": "N", "valeur_specifiee": ">300", "valeur_garantie": "" },
                { "caracteristique": "Matière", "unite": "_", "valeur_specifiee": "Polyoléfine mono orienté", "valeur_garantie": "" },
                { "caracteristique": "Couleur", "unite": "_", "valeur_specifiee": "Rouge", "valeur_garantie": "" },
                { "caracteristique": "Largeur", "unite": "mm", "valeur_specifiee": "300", "valeur_garantie": "" },
                { "caracteristique": "Dimension de maille", "unite": "mm", "valeur_specifiee": "30 x 16", "valeur_garantie": "" }
            ]
        }
    ]
};
