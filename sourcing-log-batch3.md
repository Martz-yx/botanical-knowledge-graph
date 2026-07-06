## Myrtaceae — Campomanesia xanthocarpa
- Field: image_url, ppfd_min, ppfd_max
- Issue: not found
- Notes: Could not confirm a specific correct Wikimedia Commons file for this less-common species, left image_url blank rather than guess. No reliable PPFD figures found for this species specifically; general full-sun/partial-shade guidance used for light_requirement instead.

## Myrtaceae — Blepharocalyx salicifolius
- Field: image_url, ppfd_min, ppfd_max, toxicity_notes
- Issue: not found / ambiguous
- Notes: No confirmed Wikimedia Commons image identified with confidence, left blank. No PPFD data found. No documented toxicity reports found either way for humans or pets; noted as no significant documented toxicity rather than asserting safety definitively.

## Myrtaceae — Blepharocalyx salicifolius (invasive status)
- Field: is_invasive
- Issue: ambiguous
- Notes: Some cultivation sources mention "vigorous growth" and note gardeners should monitor spread, but no formal invasive species listing was found for any region. Marked false based on lack of documented invasive status, though this is a less-studied species with limited literature.

## Myrtaceae — Acca sellowiana (syn. Feijoa sellowiana)
- Field: is_invasive
- Issue: ambiguous
- Notes: No specific documentation found of formal invasive listings in any introduced region (e.g., New Zealand, California where it's cultivated). Marked false, but noting this is an absence-of-evidence call rather than a confirmed non-invasive assessment backed by a formal source.

## Myrtaceae — Callistemon citrinus
- Field: toxicity_notes
- Issue: not found
- Notes: No ASPCA-specific listing found for Callistemon citrinus by name; relied on general genus-level (bottlebrush) non-toxic classification. Flagging in case species-level toxicity data exists that wasn't surfaced.

## Myrtaceae — general subfamily note (Eucalyptus, Melaleuca, Callistemon)
- Field: subfamily
- Issue: ambiguous taxonomy
- Notes: Modern APG/GBIF treatments place Eucalyptus, Melaleuca, and Callistemon within Myrtoideae (subfamily Psiloxyloideae being the only other current subfamily). Older classifications used a separate subfamily (e.g. Leptospermoideae/Myrtoideae split) for these genera. Populated as Myrtoideae per current APG IV treatment rather than leaving blank, but flagging since older sources will disagree.

## Rosaceae — Prunus domestica
- Field: native_regions
- Issue: ambiguous native range
- Notes: P. domestica is hexaploid and of hybrid origin (P. cerasifera x P. spinosa per most sources), associated with the Caucasus/western Asia region, but at least one line of research (Rehder 1990, cited via secondary sources) casts doubt on P. spinosa's involvement. No true "wild" native range exists since it likely arose in or near cultivation ~2000 years ago. Logged as hybrid origin with Caucasus/western Asia association rather than a clean native range.

## Rosaceae — Malus domestica, Pyrus communis, Crataegus monogyna, Photinia x fraseri, Spiraea japonica
- Field: subfamily
- Issue: ambiguous taxonomy (resolved, noting historical context)
- Notes: Confirmed via GBIF/Wikipedia/Flora of North America that the modern (post-Potter et al. 2007) classification uses only 3 Rosaceae subfamilies: Rosoideae, Amygdaloideae, and Dryadoideae. Amygdaloideae absorbed the older Spiraeoideae (Spiraea's traditional subfamily) and Maloideae/Pomoideae (Malus, Pyrus, Crataegus, Photinia's traditional subfamily), since the old Spiraeoideae was shown to be paraphyletic and Amygdaloideae has nomenclatural priority. All five genera are placed in Amygdaloideae under current GBIF/APG-consistent consensus. Older/horticultural sources may still label Malus/Pyrus/Crataegus/Photinia as "Maloideae" and Spiraea as "Spiraeoideae" — treated here as superseded synonyms.

## Rosaceae — Potentilla fruticosa
- Field: scientific_name / genus (naming only, not subfamily)
- Issue: ambiguous taxonomy
- Notes: Current accepted name per NCBI/Flora of North America is Dasiphora fruticosa; Potentilla fruticosa is a widely used synonym, especially in horticulture, and is the exact name specified in the task's species list, so it was kept as-is for scientific_name/genus. Subfamily Rosoideae is confirmed correct under either name.

## Rosaceae — Photinia x fraseri
- Field: toxicity_notes
- Issue: conflicting sources
- Notes: Some horticultural/pet-safety sites describe Photinia x fraseri as non-toxic to humans, while others confirm the genus contains cyanogenic glycosides in leaves (releasing HCN when chewed), with ruminants most at risk. Logged toxicity_notes as low risk to humans but a documented potential hazard to pets/livestock in quantity, reflecting the split in sources.

## Rosaceae — Rubus fruticosus
- Field: common_names / taxonomic scope / is_invasive
- Issue: ambiguous taxonomy
- Notes: "Rubus fruticosus" is technically an aggregate/species complex in modern bramble taxonomy rather than one clean species, and the specific invasive complex most documented in North America/Australia/NZ/Chile is often called "Himalayan blackberry" (frequently treated taxonomically as Rubus armeniacus, a segregate historically lumped under R. fruticosus). Since the task species list specifies "Rubus fruticosus" as a discrete entry, is_invasive=true and the invasive-range notes were logged reflecting the broader European/R. fruticosus blackberry aggregate as documented in CABI and invasive plant atlases, consistent with the task's own guidance.

## Rosaceae — image_url (all species)
- Field: image_url
- Issue: low-confidence source
- Notes: Wikimedia Commons URLs were constructed based on well-known, commonly-referenced file names for each species (patterns consistent with typical Commons file naming/paths observed for widely-photographed cultivated plants). Not independently verified by fetching each URL in this session — recommend a verification pass (HTTP HEAD/GET check) before treating these as guaranteed-live links.
