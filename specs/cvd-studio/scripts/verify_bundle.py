"""Verify this documentation bundle; does not test a future application.

Run: python -m pip install -r scripts/requirements-validation.txt
     python scripts/verify_bundle.py
"""
from pathlib import Path
import copy
import hashlib
import json
import math
import re
import sys
import zipfile
from urllib.parse import unquote

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource
from openapi_spec_validator import validate_spec

ROOT = Path(__file__).resolve().parents[1]
checks = []

def check(condition, label):
    if not condition:
        raise AssertionError(label)
    checks.append(label)

def no_duplicates(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f'Duplicate key: {key}')
        result[key] = value
    return result

def reject_nonfinite(value):
    raise ValueError(f'Nonfinite JSON constant: {value}')

def read(path):
    return json.loads(path.read_text(encoding='utf-8'), object_pairs_hook=no_duplicates,
                      parse_constant=reject_nonfinite)

def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'),
                                    ensure_ascii=False, allow_nan=False).encode()).hexdigest()

all_json = {p.relative_to(ROOT).as_posix(): read(p) for p in ROOT.rglob('*.json')}
check(bool(all_json), f'{len(all_json)} JSON files parse strictly')
schemas = [(p, read(p)) for p in (ROOT / 'schemas').glob('*.json')]
registry = Registry()
for path, schema in schemas:
    Draft202012Validator.check_schema(schema)
    resource = Resource.from_contents(schema)
    registry = registry.with_resource(schema['$id'], resource)
    registry = registry.with_resource(path.as_uri(), resource)
check(True, f'{len(schemas)} schemas pass Draft 2020-12 meta-schema checks')
main = read(ROOT / 'schemas/cvd-studio.schema.json')

def validator(name):
    schema = {'$schema': main['$schema'], '$ref': main['$id'] + '#/$defs/' + name}
    return Draft202012Validator(schema, registry=registry, format_checker=FormatChecker())

cases = {
    'scalar-request.synthetic.json': 'ScenarioRequest',
    'spatial-request.synthetic.json': 'ScenarioRequest',
    'zero-flux-request.synthetic.json': 'ScenarioRequest',
    'arrhenius-ideal-gas-request.synthetic.json': 'ScenarioRequest',
    'scalar-response.synthetic.json': 'SimulationResponse',
    'spatial-response.synthetic.json': 'SimulationResponse',
    'zero-flux-response.synthetic.json': 'SimulationResponse',
    'project-export.synthetic.json': 'ProjectExport',
    'validation-error.json': 'ErrorEnvelope',
    'synthetic-registry.json': 'ParameterRegistry',
    'capabilities.json': 'Capabilities',
}
for filename, name in cases.items():
    validator(name).validate(read(ROOT / 'examples' / filename))
    check(True, 'Schema-valid example: ' + filename)
validator('ParameterRegistry').validate(read(ROOT / 'registry/parameters.json'))
check(True, 'Schema-valid unresolved material registry')
for name in ['ScenarioRequest', 'SimulationResponse', 'ParameterRegistry', 'ProjectExport', 'ErrorEnvelope']:
    filename = {'ScenarioRequest':'scenario-request', 'SimulationResponse':'simulation-response',
                'ParameterRegistry':'parameter-registry', 'ProjectExport':'project-export',
                'ErrorEnvelope':'error-envelope'}[name]
    wrapper = read(ROOT / 'schemas' / (filename + '.schema.json'))
    sample = next(read(ROOT/'examples'/f) for f,n in cases.items() if n == name)
    Draft202012Validator(wrapper, registry=registry, format_checker=FormatChecker()).validate(sample)
check(True, 'Wrapper schema relative references resolve offline')

openapi = read(ROOT / 'contracts/openapi.json')
validate_spec(openapi)
check(True, 'OpenAPI 3.1.1 structural validation passes')
def rewrite(value):
    if isinstance(value, dict):
        return {k: (v.replace('#/$defs/', '#/components/schemas/') if k == '$ref' else rewrite(v))
                for k,v in value.items()}
    if isinstance(value, list):
        return [rewrite(x) for x in value]
    return value
check(openapi['components']['schemas'] == rewrite(main['$defs']), 'OpenAPI and JSON Schema definitions agree')

base = read(ROOT / 'examples/scalar-request.synthetic.json')
mutations = []
x=copy.deepcopy(base); x['unexpected']=1; mutations.append(x)
x=copy.deepcopy(base); x['kinetics']['ks']['value']='2'; mutations.append(x)
x=copy.deepcopy(base); x['kinetics']['ks']['value']=True; mutations.append(x)
x=copy.deepcopy(base); x['kinetics']['ks']['value']=0; mutations.append(x)
x=copy.deepcopy(base); x['material']='polysilicon'; mutations.append(x)
x=read(ROOT/'examples/arrhenius-ideal-gas-request.synthetic.json'); x['process_pressure']={'value':1,'unit':'Pa'}; mutations.append(x)
for i,x in enumerate(mutations):
    check(not validator('ScenarioRequest').is_valid(x), f'Invalid request rejected by schema: case {i+1}')

real = read(ROOT/'registry/parameters.json')
check(all(p['value'] is None and p['status']=='missing' and p['source_id'] is None for p in real['parameters']),
      'All material-specific parameter values remain null and unsourced')
check(all(c['min'] is None and c['max'] is None for c in real['constraints']), 'All missing process bounds remain null')
for reg in [real,read(ROOT/'examples/synthetic-registry.json')]:
    payload={k:v for k,v in reg.items() if k != 'sha256'}
    check(digest(payload)==reg['sha256'], 'Registry self-hash matches: '+reg['id'])
for f in ['scalar-response.synthetic.json','spatial-response.synthetic.json','zero-flux-response.synthetic.json']:
    response=read(ROOT/'examples'/f)
    norm=copy.deepcopy(response['normalized_inputs'])
    norm.pop('request_id'); norm.pop('notes')
    payload={'normalized_inputs':norm,'model_id':response['model_id'],'registry_snapshot':response['original_request']['registry_snapshot']}
    check(digest(payload)==response['input_sha256'], 'Input hash matches: '+f)
    check(response['runtime']['fixture_only'] and response['original_request']['basis']=='synthetic',
          'Synthetic fixture provenance preserved: '+f)

scalar=read(ROOT/'examples/scalar-response.synthetic.json')['scalar']
for field, expected in [('keff',1.2),('Cs',3),('flux',6),('growth',0.06),('growth_nm_min',3.6e9),('thickness',0.12)]:
    check(math.isclose(scalar[field]['value'],expected,rel_tol=1e-12,abs_tol=1e-14), 'Independent scalar arithmetic: '+field)
spatial=read(ROOT/'examples/spatial-response.synthetic.json')['spatial']
check(all(math.isclose(p['result']['flux']['value'],e,rel_tol=1e-12) for p,e in zip(spatial['points'],[6.15,6.45,6.75,7.05])), 'Independent radial sample arithmetic')
check(math.isclose(spatial['metrics']['mean'],6.6,rel_tol=1e-12), 'Independent radial area mean')
check(math.isclose(spatial['metrics']['population_sigma'],math.sqrt(0.1125),rel_tol=1e-12), 'Independent sampled population sigma')
check(math.isclose(sum(p['area_weight'] for p in spatial['points']),1), 'Radial area weights sum to one')
check(math.isclose(spatial['usable_area']['value'],math.pi*1e-6,rel_tol=1e-12), 'Usable area matches radius')
edges=spatial['radial_cell_edges_m']
check(all(math.isclose(math.pi*(b*b-a*a),math.pi*1e-6/4,rel_tol=1e-12) for a,b in zip(edges,edges[1:])), 'Each radial cell has equal area')
zero=read(ROOT/'examples/zero-flux-response.synthetic.json')
check(zero['spatial']['metrics']['cv_percent'] is None and zero['spatial']['metrics']['half_range_percent'] is None,
      'Zero mean normalized metrics are null')
check(zero['scalar']['growth'] is None and zero['scalar']['thickness'] is None, 'Missing growth conversion stays null')

contrast=read(ROOT/'design/contrast-report.json')
check(all(p['pass'] and p['ratio'] >= p['minimum'] for p in contrast['pairs']),
      f"All {len(contrast['pairs'])} documented color contrast pairs pass")
links=0
for p in ROOT.rglob('*.md'):
    text=p.read_text(encoding='utf-8')
    check(text.count('```') % 2 == 0, 'Balanced fenced code blocks: '+p.relative_to(ROOT).as_posix())
    for match in re.finditer(r'\[[^\]]*\]\(([^)]+)\)',text):
        target=match.group(1)
        if target.startswith(('https://','http://','mailto:','#')):
            continue
        resolved=(p.parent/unquote(target.split('#',1)[0])).resolve()
        check(resolved.is_relative_to(ROOT) and resolved.exists(), 'Local link target: '+target)
        links+=1
check(True, f'{links} local Markdown links resolve inside bundle')

manifest_path=ROOT/'MANIFEST.json'
if manifest_path.exists():
    manifest=read(manifest_path)
    present={p.relative_to(ROOT).as_posix() for p in ROOT.rglob('*') if p.is_file() and p.name!='MANIFEST.json'}
    listed={x['path'] for x in manifest['files']}
    check(present==listed, 'Manifest covers every payload file exactly')
    for item in manifest['files']:
        p=ROOT/item['path']
        check(hashlib.sha256(p.read_bytes()).hexdigest()==item['sha256'] and p.stat().st_size==item['bytes'],
              'Manifest hash: '+item['path'])

print(f'PASS: {len(checks)} checks; {len(all_json)} JSON files; {len(schemas)} schemas; {len(cases)} typed examples.')
print('Scope: documentation/contracts/fixtures only; no application implementation or experimental validation tested.')
