import {readdirSync} from 'node:fs';
import {join} from 'node:path';
import {run} from 'node:test';
import {spec} from 'node:test/reporters';

function testFiles(): string[] {
    const dir = readdirSync(__dirname, {
        withFileTypes: true,
        recursive: true
    });
    const filesPath = dir.map(file => join(file.parentPath, file.name)).filter(file => file.endsWith('.test.ts'));
    return filesPath;
}

run({
    concurrency: true,
    files: testFiles(),
}).compose(spec).pipe(process.stdout);

