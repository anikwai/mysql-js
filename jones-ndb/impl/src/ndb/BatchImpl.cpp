/*
 Copyright (c) 2015, Oracle and/or its affiliates. All rights
 reserved.
 
 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; version 2 of
 the License.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 02110-1301  USA
 */


#include <NdbApi.hpp>

#include "adapter_global.h"
#include "js_wrapper_macros.h"
#include "Record.h"
#include "NdbWrappers.h"
#include "BatchImpl.h"


BatchImpl::BatchImpl(TransactionImpl * ctx, int _sz) :
  keyOperations(new KeyOperation[_sz]),
  ops(new const NdbOperation *[_sz]),
  errors(new const NdbError *[_sz]),
  size(_sz),
  doesReadBlobs(false),
  transactionImpl(ctx)
{};


BatchImpl::~BatchImpl() {
  DEBUG_PRINT("BatchImpl destructor [size %d]", size);
  delete[] keyOperations;
  delete[] ops;
  delete[] errors;
}


void BatchImpl::prepare(NdbTransaction *ndbtx) {
  for(int i = 0 ; i < size ; i++) {
    if(keyOperations[i].opcode > 0) {
      const NdbOperation *op = keyOperations[i].prepare(ndbtx);
      ops[i] = op;
      if(! op) errors[i] = & ndbtx->getNdbError();
      DEBUG_PRINT("prepare %s [%s]", keyOperations[i].getOperationName(),
                  op ? "ok" : errors[i]->message);
      if(keyOperations[i].isBlobReadOperation()) doesReadBlobs = true;
    }
    else {
      errors[i] = 0;
      ops[i] = 0;
    }
  }
}


bool BatchImpl::tryImmediateStartTransaction() {
  if(doesReadBlobs) {
    return false;
  }
  return transactionImpl->tryImmediateStartTransaction(& keyOperations[0]);
}


