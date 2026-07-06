$families = @(
    "Araceae", "Asteraceae", "Cactaceae", "Crassulaceae", "Euphorbiaceae",
    "Fabaceae", "Lamiaceae", "Malvaceae", "Marantaceae", "Moraceae",
    "Myrtaceae", "Orchidaceae", "Piperaceae", "Rosaceae", "Rubiaceae",
    "Rutaceae", "Solanaceae", "Apocynaceae", "Campanulaceae", "Begoniaceae"
)

Write-Host "Starting Mass Botanical Sourcing (1000 species...)"

foreach ($family in $families) {
    Write-Host "================================================"
    Write-Host "Sourcing 50 species for Family: $family"
    Write-Host "================================================"
    python sourcing/hybrid_sourcer.py $family --limit 50
}

Write-Host "================================================"
Write-Host "Mass Sourcing Complete! Triggering Database Ingestion..."
Write-Host "================================================"

python ingestion/load_graph.py

Write-Host "All 1000 plants are now in your Neo4j Aura database!"
