/** Comprueba serialización, desempate y rechazo de cursores manipulados. */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import mongoose from 'mongoose';
import {
    buildCursorFilter,
    decodePaginationCursor,
    encodePaginationCursor,
} from '../src/utils/paginationCursor.js';

describe('paginationCursor', () => {
    it('codifica y decodifica una posición estable', () => {
        const position = {
            createdAt: new Date('2026-01-02T03:04:05.000Z'),
            _id: new mongoose.Types.ObjectId('65a000000000000000000001'),
        };

        const decoded = decodePaginationCursor(encodePaginationCursor(position));

        assert.equal(decoded.createdAt.toISOString(), position.createdAt.toISOString());
        assert.equal(String(decoded._id), String(position._id));
    });

    it('construye un filtro que desempata por ObjectId', () => {
        const position = {
            createdAt: new Date('2026-01-02T03:04:05.000Z'),
            _id: new mongoose.Types.ObjectId('65a000000000000000000001'),
        };

        const filter = buildCursorFilter(encodePaginationCursor(position));

        assert.deepEqual(filter, {
            $or: [
                { createdAt: { $lt: position.createdAt } },
                { createdAt: position.createdAt, _id: { $lt: position._id } },
            ],
        });
    });

    it('rechaza cursores manipulados', () => {
        assert.throws(
            () => decodePaginationCursor('cursor-invalido'),
            (error) => error.statusCode === 422
        );
    });
});
