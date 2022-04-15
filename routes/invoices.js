"use strict"

const express = require("express");
const db = require("../db");
const { NotFoundError } = require("../expressError.js");
const router = new express.Router();
// command + shift + l
/** GET /invoices: get list of invoices */
// GET /invoices
// Return info on invoices: like {invoices: [{id, comp_code}, ...]}
router.get("/", async function (req, res) {
    const results = await db.query(
        ` SELECT  id, comp_code
        FROM  invoices
        `);
    const invoices = results.rows
    return res.json({ invoices })
});

// /** GET /invoice/:name: return single invoice */
// GET /invoices/[id]
// Returns obj on given invoice.

// If invoice cannot be found, returns 404.

// Returns {invoice: {id, amt, paid, add_date, paid_date, invoice: {code, name, description}}
router.get("/:id", async function (req, res) {
    let invoiceId = req.params.id
    const results = await db.query(
        `SELECT id, amt, paid, add_date, paid_date, name, code, description
        FROM invoices
        JOIN companies
        ON invoices.comp_code = companies.code
        WHERE id = $1
        `, [invoiceId]
    );
    // const comp_code_results = await db.query(
    //     `SELECT comp_code
    //     FROM invoices
    //     WHERE id = $1
    //     `, [invoiceId]
    // );

    // let comp_code = comp_code_results.rows[0].comp_code
    // const company_result = await db.query(
    //     `SELECT code, name, description
    //     FROM companies
    //     WHERE code = $1
    //     `, [comp_code]
    // );
    // let company = company_result.rows[0]
    let invoice = results.rows[0]
    let { id, amt, paid, add_date, paid_date, name, description, code } = invoice
    if (!invoice) throw new NotFoundError(`Not found ${invoiceId}`);
    // invoice.company = company
    return res.json({ invoice: { id, amt, paid, add_date, paid_date, 
                        company: { name, description, code }}});
});

// /** POST /invoice/ create single invoice */
// POST /invoices
// Adds an invoice.

// Needs to be passed in JSON body of: {comp_code, amt}

// Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

router.post("/", async function (req, res) {
    const { comp_code, amt } = req.body
    //we can add try throw for amt integrity
    const results = await db.query(
        `INSERT INTO invoices( comp_code, amt )
     VALUES ($1, $2)
     RETURNING id, comp_code, amt, paid, add_date, paid_date;
    `,
        [comp_code, Number(amt)]
    );
    let invoice = results.rows[0]
    return res.json({ invoice });
});

// /** PUT /invoice/ update single invoice */
// PUT /invoices/[id]
// Updates an invoice.

// If invoice cannot be found, returns a 404.

// Needs to be passed in a JSON body of {amt}

// Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
router.put("/:id", async function (req, res) {
    const id = req.params.id
    const { amt } = req.body
    const results = await db.query(
        `UPDATE invoices
      SET amt=$2
      WHERE id = $1
      RETURNING id, comp_code, amt, paid, add_date, paid_date
    `,
        [id, amt]
    );
    let invoice = results.rows[0]
    if (!invoice) throw new NotFoundError(`Not found ${id}`);
    return res.json({ invoice });
});


// /** DELETE /invoices/:id delete single invoice */
router.delete("/:id", async function (req, res) {
    const id = req.params.id
    const results = await db.query(
        `DELETE FROM invoices
     WHERE id = $1
     RETURNING id
    `,
        [id]
    );
    let invoice = results.rows[0]
    if (!invoice) throw new NotFoundError(`Not found ${id}`);
    return res.json({ status: `DELETED ${id}` });
});

module.exports = router;








// GET /invoices/[id]
// Return obj of invoice: {invoice: {id, name, description, invoices: [id, ...]}}

// If the invoice given cannot be found, this should return a 404 status response.