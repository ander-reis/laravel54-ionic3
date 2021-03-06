<?php

namespace CodeFlix\Repositories;

use Prettus\Repository\Eloquent\BaseRepository;
use Prettus\Repository\Criteria\RequestCriteria;
use CodeFlix\Models\PayPalWebProfile;

/**
 * Class PayPalWebProfileRepositoryEloquent
 * @package namespace CodeFlix\Repositories;
 */
class PayPalWebProfileRepositoryEloquent extends BaseRepository implements PayPalWebProfileRepository
{

    /**
     * @param array $attributes
     * @return mixed
     * @throws \Exception
     */
    public function create(array $attributes)
    {
        $attributes['code'] = 'processing';

        \DB::beginTransaction();
        //dd(\DB::beginTransaction());
        try {
            $model = parent::create($attributes);
        } catch (\Exception $exception) {
            \DB::rollBack();
            throw $exception;
        }
        \DB::commit();
        return $model;
    }

    public function update(array $attributes, $id)
    {
        \DB::beginTransaction();
        try{
            $model = parent::update($attributes, $id);
        }catch (\Exception $exception){
            \DB::rollBack();
            throw $exception;
        }
        \DB::commit();
        return $model;
    }

    public function delete($id)
    {
        \DB::beginTransaction();
        try{
            $result = parent::delete($id);
        }catch (\Exception $exception){
            \DB::rollBack();
            throw $exception;
        }
        \DB::commit();
        return $result;
    }

    /**
     * Specify Model class name
     *
     * @return string
     */
    public function model()
    {
        return PayPalWebProfile::class;
    }

    /**
     * Boot up the repository, pushing criteria
     */
    public function boot()
    {
        $this->pushCriteria(app(RequestCriteria::class));
    }
}
