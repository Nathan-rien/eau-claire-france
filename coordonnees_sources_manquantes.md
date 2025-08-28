# Coordonnées manquantes pour les sources d'eau

## Sources principales avec coordonnées connues :
- **Évian** (Cachat) : [6.5885, 46.4008] ✅
- **Volvic** (Clairvic) : [3.0319, 45.8708] ✅
- **Vittel** (Grande Source) : [5.9469, 48.2034] ✅
- **Contrex** (Source Contrex) : [5.8936, 48.1847] ✅
- **Hépar** : [5.9500, 48.2100] ✅
- **Perrier** (Les Bouillens) : [3.9500, 43.7500] ✅
- **Badoit** : [4.2500, 45.5333] ✅

## Coordonnées manquantes à rechercher :

### Eaux minérales naturelles plates :
1. **Abatilles** - Saint-Anne, Arcachon (Gironde) - ❌ MANQUE
2. **Aix-les-Bains** - Raphy-St-Simon Est, Grésy-sur-Aix (Savoie) - ❌ MANQUE
3. **Alizée** - Chambon-la-Forêt (Loiret) - ❌ MANQUE
4. **Amanda** - Saint-Amand-les-Eaux (Nord) - ❌ MANQUE
5. **Biovive** - Dax (Landes) - ❌ MANQUE
6. **Celtic (La Liese)** - Niederbronn-les-Bains (Bas-Rhin) - ❌ MANQUE
7. **Chambon (Montfras)** - Chambon-la-Forêt (Loiret) - ❌ MANQUE
8. **Hydroxydase** - Le Breuil-sur-Couze (Puy-de-Dôme) - ❌ MANQUE
9. **La Cairolle** - Les Aires (Hérault) - ❌ MANQUE
10. **La Française** - Propiac (Drôme) - ❌ MANQUE
11. **Luchon** - Bagnères-de-Luchon (Haute-Garonne) - ❌ MANQUE
12. **Mont Roucous** - Lacaune (Tarn) - ❌ MANQUE
13. **Montcalm** - Auzat (Ariège) - ❌ MANQUE
14. **Ogeu** - Ogeu-les-Bains (Pyrénées-Atlantiques) - ❌ MANQUE
15. **Orée du Bois** - Saint-Amand-les-Eaux (Nord) - ❌ MANQUE
16. **Plancoët** - Plancoët (Côtes-d'Armor) - ❌ MANQUE
17. **Prince Noir** - Saint-Antonin-Noble-Val (Tarn-et-Garonne) - ❌ MANQUE
18. **Thonon** - Thonon-les-Bains (Haute-Savoie) - ❌ MANQUE
19. **Velleminfroy** - Haute-Saône - ❌ MANQUE
20. **Wattwiller** - Haut-Rhin - ❌ MANQUE

### Eaux minérales naturelles gazeuses :
1. **Aizac** - Aizac (Ardèche) - ❌ MANQUE
2. **Arcens (Perline)** - Arcens (Ardèche) - ❌ MANQUE
3. **Arvie** - Augnat (Puy-de-Dôme) - ❌ MANQUE
4. **César** - Saint-Alban-les-Eaux (Loire) - ❌ MANQUE
5. **Châteauneuf-Auvergne** - Châteauneuf-les-Bains (Puy-de-Dôme) - ❌ MANQUE
6. **Châteldon** - Châteldon (Puy-de-Dôme) - ❌ MANQUE
7. **Cilaos** - Cilaos (Réunion) - ❌ MANQUE
8. **Faustine** - Saint-Alban-les-Eaux (Loire) - ❌ MANQUE
9. **La Salvetat** - La Salvetat-sur-Agout (Hérault) - ❌ MANQUE
10. **Le Vernet** - Prades (Ardèche) - ❌ MANQUE
11. **Nessel** - Soultzmatt (Haut-Rhin) - ❌ MANQUE
12. **Orezza** - Rapaggio (Haute-Corse) - ❌ MANQUE
13. **Puits Saint-Georges** - Saint-Romain-le-Puy (Loire) - ❌ MANQUE
14. **Quézac** - Quézac (Lozère) - ❌ MANQUE
15. **Reine des Basaltes** - Asperjoc (Ardèche) - ❌ MANQUE
16. **Rozana** - Beauregard-Vendon (Puy-de-Dôme) - ❌ MANQUE
17. **Saint-Yorre** - Bassin de Vichy, Allier - ❌ MANQUE
18. **Ventadour** - Meyras (Ardèche) - ❌ MANQUE
19. **Vernière** - Les Aires (Hérault) - ❌ MANQUE
20. **Vichy Célestins** - Bassin de Vichy, Allier - ❌ MANQUE

### Sources multiples (MDD) :
1. **Cristaline** - Sources multiples France - ❌ MANQUE GÉOLOCALISATION
2. **Laqueuille** - Source spécifique - ❌ MANQUE
3. **Grand Barbier** - Source spécifique - ❌ MANQUE
4. **Fiée des Lois** - Source spécifique - ❌ MANQUE
5. **Sainte-Sophie** - Source spécifique - ❌ MANQUE

## Solutions recommandées :

1. **Recherche manuelle** : Utiliser les communes indiquées pour obtenir les coordonnées GPS
2. **API de géocodage** : Implémenter un service pour convertir automatiquement les noms de lieux
3. **Base de données géographique** : Créer une table de correspondance commune → coordonnées
4. **Regroupement régional** : Pour les sources inconnues, les regrouper par département/région

## Urgence par usage :
- **Critique** : Évian, Volvic, Vittel, Contrex, Hépar, Perrier, Badoit (déjà OK)
- **Important** : Mont Roucous, Thonon, Plancoët, Quézac, Saint-Yorre
- **Secondaire** : Sources régionales moins connues