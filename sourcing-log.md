# Flora Graph — Sourcing Log

Running log of gaps, uncertainties, and low-confidence data points. Append one entry per issue as you go.

Format:
```
## [Family] — [Species scientific name]
- Field: (column, or "subfamily placement", or "companion edge")
- Issue: not found / conflicting sources / ambiguous taxonomy
- Notes: brief
```

---

## Bignoniaceae — Handroanthus impetiginosus
- Field: image_url
- Issue: not found
- Notes: No Wikimedia Commons image confirmed — common name "Lapacho" may refer to multiple taxa; image skipped.

## Bignoniaceae — Jacaranda mimosifolia
- Field: is_invasive
- Issue: ambiguous
- Notes: Reported as invasive in South Africa under NEMBA Category 1b; invasive in parts of Australia. Marked false in this CSV pending species-level confirmation per region.

## Bignoniaceae — all species
- Field: subfamily
- Issue: taxonomy check
- Notes: Bignoniaceae subfamilies per APG IV (not populated here — left blank per schema convention since horticultural guidance does not rely heavily on subfamily rank). If app needs it: Bignonieae, Tecomeae, crescentieae are relevant tribes but subfamily placement beyond that varies across sources.

## Myrtaceae — Campomanesia xanthocarpa
- Field: image_url, ppfd_min, ppfd_max
- Issue: not found
- Notes: No confirmed Wikimedia Commons file identified for this less-common species; image left blank. No reliable PPFD data.

## Myrtaceae — Blepharocalyx salicifolius
- Field: image_url, ppfd_min, ppfd_max, toxicity_notes
- Issue: not found / ambiguous
- Notes: Left image, PPFD, and toxicity blank. No documented toxicity reports found.

## Myrtaceae — Blepharocalyx salicifolius (invasive)
- Field: is_invasive
- Issue: ambiguous
- Notes: No formal invasive listing found; marked false based on absence of evidence.

## Myrtaceae — Acca sellowiana (syn. Feijoa sellowiana)
- Field: is_invasive
- Issue: ambiguous
- Notes: No documented invasive listings; marked false with caveat.

## Myrtaceae — Callistemon citrinus
- Field: toxicity_notes
- Issue: not found / low-confidence source
- Notes: No ASPCA-specific listing by species name; relied on genus-level classification — flagging for verification.

## Myrtaceae — general subfamily note (Eucalyptus, Melaleuca, Callistemon)
- Field: subfamily
- Issue: ambiguous taxonomy
- Notes: Per APG IV, placed in Myrtoideae; older classifications treated Leptospermoideae as separate subfamily for these genera. Populated as Myrtoideae per current consensus.

## Rosaceae — Prunus domestica
- Field: subfamily (resolved), unrelated: hybrid origin
- Issue: ambiguous taxonomy / no true native range
- Notes: Hexaploid hybrid origin (P. cerasifera × P. spinosa per most sources); no true wild native range. Logged rather than forcing a range.

## Rosaceae — Malus domestica, Pyrus communis, Crataegus monogyna, Photinia x fraseri, Spiraea japonica
- Field: subfamily
- Issue: ambiguous taxonomy (resolved)
- Notes: Current APG post-Potter et al. 2007 treatment places all in Amygdaloideae. Older "Maloideae", "Spiraeoideae", "Pomoideae" are superseded for horticultural use but may appear in older literature.

## Rosaceae — Potentilla fruticosa
- Field: scientific_name (kept per task) / subfamily
- Issue: ambiguous taxonomy
- Notes: Current accepted name is Dasiphora fruticosa; kept Potentilla fruticosa per species list. Subfamily Rosoideae is correct under either name.

## Rosaceae — Photinia x fraseri
- Field: toxicity_notes
- Issue: conflicting sources
- Notes: Sources split — some say non-toxic, others confirm cyanogenic glycoside potential. Logged as low risk to humans, potential hazard to pets/livestock.

## Rosaceae — Rubus fruticosus
- Field: is_invasive / taxonomic scope
- Issue: ambiguous taxonomy
- Notes: Aggregate/species complex; N. American invasive often R. armeniacus (segreate from R. fruticosus). Kept per task name, marked invasive=true reflecting complex-wide CABI docs.

## Rosaceae — image_url (all Rosaceae species)
- Field: image_url
- Issue: low-confidence source
- Notes: Wikimedia URLs constructed from known Commons file patterns; not independently verified by HTTP check. Recommend verification pass.

## Crassulaceae — all image_url fields
- Field: image_url
- Issue: unverified standardized source
- Notes: Image URLs were not individually verified by HTTP fetch; blank positions assume availability for popular species but should be validated before release.

## Crassulaceae — subfamily ambiguity (global note)
- Field: subfamily for Sempervivoideae genera
- Issue: taxonomy
- Notes: Current APG/GBIF placement uses Sempervivoideae broadly for Echeveria, Sedum, Pachyphytum, Aeonium, Sempervivum, Graptopetalum, etc.; older classifications occasionally split these genera differently. Used current consensus.

## Crassulaceae — all genera
- Field: image_url
- Issue: not verified
- Notes: Expected available but not independently fetched — recommend HTTP HEAD check before release.

## Crassulaceae — toxicity blanket sensitivity
- Field: toxicity_notes (generic blanket entries)
- Issue: source coverage
- Notes: Asparagaceae entries applying blanket 'non-toxic per ASPCA' language are imprecise for many Asparagaceae species — recommended narrowing claim to documented species-specific listings.

## Crassulaceae — Sedum acre is_invasive
- Field: is_invasive
- Issue: absence-of-evidence
- Notes: Marked false based on lack of formal invasive listings in major regions; widely naturalized in parts of Europe/North America but not formally invasive. Conservative false used.

## Crassulaceae — Crassula ovata, Crassula perforata, Crassula muscosa, Adromischus cristatus, Cotyledon orbiculata, Kalanchoe daigremontiana/to mentosa/blossfeldiana
- Field: toxicity_notes
- Issue: lower-confidence source
- Notes: Per general Crassulaceae references, Kalanchoe spp. contain bufadienolides (well-documented for K. daigremontiana in livestock/pet literature); Crassula spp. and Cotyledon generically linked to cardiac glycosides. Specific species-level ASPCA/pet-safety listings were not independently confirmed for all entries. Notes reflect genus-level risk; flagged for species-level verification.

## Orchidaceae — Paphiopedilum callosum, Ludisia discolor
- Field: subfamily
- Issue: ambiguous taxonomy
- Notes: Per APG IV: Paphiopedilum → Cypripedioideae; Ludisia → Orchidoideae; all others Epidendroideae. Populated per current evidence.

## Orchidaceae — Zygopetalum intermedium, Masdevallia coccinea, Bulbophyllum lobbii
- Field: ppfd_min, ppfd_max, growth_pattern, mature_height_cm, light_requirement, soil_type
- Issue: sparse care data (risk item — blank per schema rules)
- Notes: Minimal horticultural data across general sources; care fields left blank to avoid fabrication. Confidence low overall for these three species.

## Orchidaceae — Vanilla planifolia
- Field: growth_pattern, mature_height_cm
- Issue: not found (cultivation vs wild size mismatch)
- Notes: Climbing vine typically >1000 cm in nature; adjusted to 1500 cm to reflect wild vigour; cultivated plants differ.

## Orchidaceae — general care-data risk note
- Field: all
- Issue: care data quality risk item ( Orchidaceae flagged in schema rule )
- Notes: Care data for many orchid species is consistently thin across sources. Blank cells preferred over fabricated values. App layer should handle missing CareProfile fields gracefully — show "Data not yet available" rather than default values.

## Asparagaceae — Sansevieria trifasciata / Sansevieria cylindrica vs Dracaena
- Field: scientific_name / genus placement
- Issue: ambiguous taxonomy (resolved — keep per task list)
- Notes: Sansevieria is currently accepted as synonym of Dracaena by some sources; GBIF/WCSP still list Sansevieria as distinct. Kept Sansevieria per species list. Subfamily Nolinoideae confirmed for both Sansevieria and Dracaena under APG/GBIF. Older horticultural literature may differ.

## Asparagaceae — Cordyline fruticosa, Beaucarnea recurvata, Ruscus aculeatus
- Field: subfamily
- Issue: ambiguous taxonomy (resolved)
- Notes: APG IV places Cordyline and Beaucarnea in Nolinoideae; Ruscus also in Nolinoideae per APG/GBIF. Population per current consensus; older horticultural literature may differ.

## Lamiaceae — Perilla frutescens
- Field: toxicity_notes
- Issue: lower-confidence
- Notes: Shiso leaves are consumed as food, but some sources flag Perilla seed/leaf as moderate concern; large consumption of raw leaf by pets may cause GI upset. Notes reflect conditional risk.

## Lamiaceae — Salvia splendens
- Field: toxicity_notes
- Issue: lower-confidence source
- Notes: Commonly listed as non-toxic, but species-specific veterinary toxicity data for scarlet sage (Salvia splendens) is sparse; treated as low-toxicity ornamental pending species-level ASPCA check.

## Apiaceae — Conium maculatum
- Field: all care data cautiously left blank
- Issue: high toxicity + care-data risk
- Notes: Wild toxic plant not cultivated for food/ornament; hostility to humans/pets well-documented. Care data (watering, soil, growth) considered secondary — toxin potential means horticultural treatment is rare.

## Brassicaceae — Erysimum cheiri toxicity_notes
- Field: toxicity_notes
- Issue: source-specific
- Notes: Mild toxicity to cats/dogs via glucosinolate derivatives causing GI irritation as per ASPCA-type listings. Documents a non-negligible but minor toxicity level.

## Pollinator edges — general confidence calibration note
- Field: confidence column
- Issue: non-uniform source quality
- Notes: pollinator_edges.csv grades confidence based on primary source (agricultural pollinator biology for crops, plant-pollinator literature for ornamentals, apiculture refs for herbs). Crops are higher confidence; ornamentals and herb neighbor-pairs are lower confidence.

## Companion edges — Brassicaceae + Allium spp. (composite genus)
- Field: species
- Issue: directional ambiguity
- Notes: List specifies Allium per companion advice; Allium cepa and Allium sativum are commonly applied to beans. Logged at the pair level without collapsing Allium genus into single species.

## All orchid companion/pollinator edges
- Field: companion edges, pollinator edges
- Issue: not available
- Notes: Orchid companion planting ecology and specific pollinator pairings for 20 listed orchids are not well-documented and mostly unavailable from reliable horticultural sources. Edges omitted entirely rather than added at low confidence. Orchids are pollinated by specific insects/moths (Lepidoptera, Apidae for Vandas) — add when species-level data is available.

---

(entries will continue as subsequent batches complete)
